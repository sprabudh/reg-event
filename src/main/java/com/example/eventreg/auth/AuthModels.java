package com.example.eventreg.auth;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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

    /**
     * The identity behind the token. Kept as its own object so the client
     * receives { "token": "eyJ...", "user": { "role": ..., "name": ... } }
     * rather than three sibling keys -- role and name describe the user, the
     * token is the credential.
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonPropertyOrder({ "role", "name" })
    public static class UserInfo {
        private String role;
        private String name;
    }

    /**
     * Auth responses from /register, /register-admin and /authenticate.
     *
     * Serializes as:
     *   {  { "role": ..., "name": ... }, "token": "eyJ..." }
     *
     * @JsonPropertyOrder pins the key order. Jackson's default depends on
     * getter-introspection order, which is not something the client should
     * ever have to care about -- declare it so the wire format is stable.
     *
     * token stays a plain String on purpose: it is sent verbatim as
     * `Authorization: Bearer <token>`, so it must remain a scalar.
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonPropertyOrder({ "user", "token" })
    public static class AuthenticationResponse {
        private UserInfo user;
        private String token;
    }
}