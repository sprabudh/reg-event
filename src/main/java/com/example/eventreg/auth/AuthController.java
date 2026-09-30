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
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AuthModels.AuthenticationResponse> registerAdmin(@Valid @RequestBody AuthModels.RegisterRequest request) {
        return ResponseEntity.ok(service.registerAdmin(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthModels.AuthenticationResponse> authenticate(@Valid @RequestBody AuthModels.AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}