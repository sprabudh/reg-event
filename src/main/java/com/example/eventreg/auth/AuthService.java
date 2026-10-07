package com.example.eventreg.auth;

import com.example.eventreg.exception.AccountTypeMismatchException;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Domain hosts must sign up with. Configurable so it is not buried in
     * code, and empty by default would disable the rule entirely -- set it in
     * application.security.auth.host-email-domain to enforce.
     */
    @Value("${application.security.auth.host-email-domain:@eventora.com}")
    private String hostEmailDomain;

    // Normal User Registration. Unchanged: still always Role.USER.
    public AuthModels.AuthenticationResponse register(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.USER);
    }

    // Secret Admin Registration!
    public AuthModels.AuthenticationResponse registerAdmin(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.ADMIN);
    }

    /**
     * Registration honouring an explicit accountType.
     *
     * ATTENDEE and anything unrecognised both fall through to Role.USER, so
     * this is a superset of register(...) and cannot change how existing
     * attendee signups behave.
     */
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
     * Mints the JWT and pairs it with the caller's identity.
     *
     * Shared by all three auth entry points (register, register-admin,
     * authenticate) so the response shape is defined in exactly one place.
     */
    private AuthModels.AuthenticationResponse toResponse(User user) {
        return AuthModels.AuthenticationResponse.builder()
                .user(AuthModels.UserInfo.builder()
                        .role(user.getRole().name())
                        .name(user.getName())
                        .build())
                .token(jwtService.generateToken(user))
                .build();
    }
}