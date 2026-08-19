package com.example.eventreg.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthModels.AuthenticationResponse> register(@RequestBody AuthModels.RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AuthModels.AuthenticationResponse> registerAdmin(@RequestBody AuthModels.RegisterRequest request) {
        return ResponseEntity.ok(service.registerAdmin(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthModels.AuthenticationResponse> authenticate(@RequestBody AuthModels.AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}