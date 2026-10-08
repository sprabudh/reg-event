package com.example.eventreg.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthModels.AuthenticationResponse> register(@Valid @RequestBody AuthModels.RegisterRequest request) {
        // Honours request.accountType when present (HOST), otherwise creates a
        // normal attendee exactly as before.
        return ResponseEntity.ok(service.registerWithAccountType(request));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AuthModels.AuthenticationResponse> registerAdmin(@Valid @RequestBody AuthModels.RegisterRequest request) {
        return ResponseEntity.ok(service.registerAdmin(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthModels.AuthenticationResponse> authenticate(@Valid @RequestBody AuthModels.AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    /**
     * Exchanges a refresh token for a fresh pair. Public by necessity -- the
     * access token has expired, so the caller cannot authenticate -- which is
     * safe because the refresh token itself is the credential and is checked
     * against the server-side record.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthModels.AuthenticationResponse> refresh(@Valid @RequestBody AuthModels.RefreshRequest request) {
        return ResponseEntity.ok(service.refresh(request));
    }

    /**
     * Ends a session. Always answers 204, even for an unknown or already-revoked
     * token: the client's intent ("this session is over") is satisfied either
     * way, and reporting failure would leak whether a token was ever valid.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) AuthModels.LogoutRequest request,
                                       java.security.Principal principal) {
        String refreshToken = request == null ? null : request.getRefreshToken();
        service.logout(refreshToken, principal == null ? null : principal.getName());
        return ResponseEntity.noContent().build();
    }
}