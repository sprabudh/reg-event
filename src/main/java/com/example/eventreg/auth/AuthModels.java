package com.example.eventreg.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthModels {

    public static final String PASSWORD_POLICY = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";
    public static final String PASSWORD_POLICY_MESSAGE = "Password format doesn't match";
    public static final String EMAIL_POLICY = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$";
    public static final String EMAIL_POLICY_MESSAGE = "Enter a valid Email ID";

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Pattern(regexp = EMAIL_POLICY, message = EMAIL_POLICY_MESSAGE)
        private String email;

        @NotBlank(message = "Password is required")
        @Pattern(regexp = PASSWORD_POLICY, message = PASSWORD_POLICY_MESSAGE)
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthenticationRequest {
        @NotBlank(message = "Email is required")
        @Pattern(regexp = EMAIL_POLICY, message = EMAIL_POLICY_MESSAGE)
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthenticationResponse {
        private String token;
        private String role;
        private String name;
    }
}