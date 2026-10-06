package com.example.eventreg.auth;

import com.example.eventreg.security.JwtService;
import com.example.eventreg.user.Role;
import com.example.eventreg.user.User;
import com.example.eventreg.user.UserRepository;
import lombok.RequiredArgsConstructor;
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

    // Normal User Registration
    public AuthModels.AuthenticationResponse register(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.USER);
    }

    // Secret Admin Registration!
    public AuthModels.AuthenticationResponse registerAdmin(AuthModels.RegisterRequest request) {
        return createAccount(request, Role.ADMIN);
    }

    private AuthModels.AuthenticationResponse createAccount(AuthModels.RegisterRequest request, Role role) {
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        var saved = repository.save(user);
        return toResponse(saved);
    }

    public AuthModels.AuthenticationResponse authenticate(AuthModels.AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        return toResponse(user);
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