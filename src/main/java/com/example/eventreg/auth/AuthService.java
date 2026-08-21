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
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return AuthModels.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name()) // Send the role to React!
                .name(user.getName())        // <--- ADDED THIS: Send the name to React!
                .build();
    }

    public AuthModels.AuthenticationResponse authenticate(AuthModels.AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthModels.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name()) // Send the role to React!
                .name(user.getName())        // <--- ADDED THIS: Send the name to React!
                .build();
    }
}