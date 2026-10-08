package com.example.eventreg.auth;

import com.example.eventreg.exception.AccountTypeMismatchException;
import com.example.eventreg.exception.InvalidRefreshTokenException;
import com.example.eventreg.security.JwtService;
import com.example.eventreg.user.Role;
import com.example.eventreg.user.User;
import com.example.eventreg.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Domain hosts must sign up with. Configurable so it is not buried in
     * code, and empty by default would disable the rule entirely -- set it in
     * application.security.auth.host-email-domain to enforce.
     */
    @Value("${application.security.auth.host-email-domain:@eventora.com}")
    private String hostEmailDomain;

    // Normal User Registration. Unchanged: still always Role.USER.
    @Transactional
    public AuthModels.AuthenticationResponse register(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.USER);
    }

    // Secret Admin Registration!
    @Transactional
    public AuthModels.AuthenticationResponse registerAdmin(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.ADMIN);
    }

    /**
     * Registration honouring an explicit accountType.
     *
     * ATTENDEE and anything unrecognised both fall through to Role.USER, so this
     * is a superset of register(...) and cannot change how existing
     * attendee signups behave.
     */
    @Transactional
    public AuthModels.AuthenticationResponse registerWithAccountType(AuthModels.RegisterRequest request) {
        return createAccount(request, resolveRegisterRole(request.getAccountType()));
    }

    private Role resolveRegisterRole(String accountType) {
        return AuthModels.ACCOUNT_TYPE_HOST.equalsIgnoreCase(accountType) ? Role.HOST : Role.USER;
    }

    private AuthModels.AuthenticationResponse createAccount(AuthModels.RegisterRequest request, Role role) {
        if (role == Role.HOST) {
            assertHostEmail(request.getEmail());
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        var saved = repository.save(user);
        return toResponse(saved);
    }

    /**
     * HOST accounts are gated to the platform domain. Runs before the insert
     * so a rejected signup never creates a row.
     *
     * The role is still the real security boundary -- this is a business rule
     * on top, and it only stops someone picking "Host" at signup with a
     * personal address.
     */
    private void assertHostEmail(String email) {
        String domain = hostEmailDomain == null ? "" : hostEmailDomain.trim().toLowerCase();
        if (domain.isEmpty()) return;                       // rule disabled
        String candidate = email == null ? "" : email.trim().toLowerCase();
        if (!candidate.endsWith(domain)) {
            throw new AccountTypeMismatchException(AuthModels.HOST_DOMAIN_MESSAGE);
        }
    }

    @Transactional
    public AuthModels.AuthenticationResponse authenticate(AuthModels.AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = repository.findByEmail(request.getEmail()).orElseThrow();

        // Optional gate. Runs only when the caller sent an accountType, so the
        // existing UI (which never sends one) keeps working untouched and
        // ADMIN is never caught by the attendee/host check.
        assertAccountTypeMatches(request.getAccountType(), user.getRole());

        return toResponse(user);
    }

    /**
     * Enforces "a host cannot sign in through the attendee door, or vice
     * versa". ADMIN is exempt -- it is neither, and is not part of this
     * distinction.
     */
    private void assertAccountTypeMatches(String accountType, Role actual) {
        if (accountType == null || accountType.isBlank()) return;
        if (actual == Role.ADMIN) return;

        boolean wantsHost = AuthModels.ACCOUNT_TYPE_HOST.equalsIgnoreCase(accountType);
        boolean isHost = actual == Role.HOST;

        if (wantsHost != isHost) {
            String expected = wantsHost ? "Host" : "Attendee";
            throw new AccountTypeMismatchException(
                    "This email is not registered as a " + expected + " account.");
        }
    }

    /**
     * Mints the token pair and pairs it with the caller's identity.
     *
     * Shared by all three auth entry points (register, register-admin,
     * authenticate) plus refresh, so the response shape is defined in exactly
     * one place.
     */
    private AuthModels.AuthenticationResponse toResponse(User user) {
        return issueSession(user);
    }

    /**
     * Issues an access/refresh pair and persists the refresh token's hash.
     *
     * Every login and every refresh goes through here, so a session always has
     * exactly one server-side record and revocation has something to act on.
     */
    private AuthModels.AuthenticationResponse issueSession(User user) {
        // Opportunistic cleanup, run only on login/refresh. Adding a scheduled
        // task would mean a new background thread on startup, and signing in
        // already touches this table.
        //
        // Swallowed deliberately: housekeeping must never be the reason a
        // sign-in fails. A failed sweep only means dead rows linger a little
        // longer, which is harmless.
        try {
            purgeExpiredTokens();
        } catch (RuntimeException ignored) {
            // Deliberately empty -- see above.
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Instant now = Instant.now();
        refreshTokenRepository.save(RefreshToken.builder()
                .tokenHash(hash(refreshToken))
                .userEmail(user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plusMillis(jwtService.getRefreshExpirationMillis()))
                .revoked(false)
                .build());

        return AuthModels.AuthenticationResponse.builder()
                .user(AuthModels.UserInfo.builder()
                        .role(user.getRole().name())
                        .name(user.getName())
                        .build())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessExpirationSeconds())
                .build();
    }

    /**
     * Exchanges a refresh token for a new pair, revoking the old one.
     *
     * Rotation is why "log out" and "refresh" can both actually end a session:
     * every refresh retires the presented token, so a stolen copy is good for at
     * most one use, and the legitimate client's next refresh is the one that
     * succeeds.
     */
        @Transactional
    public AuthModels.AuthenticationResponse refresh(AuthModels.RefreshRequest request) {
        String presented = request.getRefreshToken();
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(presented))
                .orElseThrow(() -> new InvalidRefreshTokenException(
                        "Session expired. Please sign in again."));

        if (!stored.isUsable(Instant.now())) {
            // Expired, or already rotated away / revoked by a logout.
            throw new InvalidRefreshTokenException("Session expired. Please sign in again.");
        }
        if (!jwtService.isTokenUsable(presented)) {
            // The hash matched but the JWT itself no longer verifies: treat the
            // session as gone rather than trusting the row.
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new InvalidRefreshTokenException("Session expired. Please sign in again.");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        var user = repository.findByEmail(stored.getUserEmail())
                .orElseThrow(() -> new InvalidRefreshTokenException("Session expired. Please sign in again."));

        return issueSession(user);
    }

    /**
     * Ends a session.
     *
     * With a refresh token only that session dies; without one, every live
     * session for the caller is revoked (the "sign out everywhere" case). Never
     * throws: logging out with an already-dead token must still look successful
     * to the client.
     */
    @Transactional
    public void logout(String refreshToken, String callerEmail) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(hash(refreshToken))
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
            return;
        }
        if (callerEmail != null && !callerEmail.isBlank()) {
            refreshTokenRepository.deleteByUserEmailAndRevokedFalse(callerEmail);
        }
    }

    /** Best-effort cleanup of sessions whose window has already closed. */
    public int purgeExpiredTokens() {
        return refreshTokenRepository.deleteExpired(Instant.now());
    }

    /**
     * SHA-256, hex encoded. The plaintext token is never stored, so this is the
     * only thing in the table that can be compared against an incoming token.
     */
    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(Character.forDigit((b >> 4) & 0xF, 16));
                hex.append(Character.forDigit(b & 0xF, 16));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}