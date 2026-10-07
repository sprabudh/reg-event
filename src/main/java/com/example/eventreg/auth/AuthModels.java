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

    /** accountType values the client may send on register/login. */
    public static final String ACCOUNT_TYPE_ATTENDEE = "ATTENDEE";
    public static final String ACCOUNT_TYPE_HOST = "HOST";

    public static final String HOST_DOMAIN_MESSAGE =
            "Host accounts must use an @eventora.com email address.";

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

        /**
         * Optional. Absent or ATTENDEE keeps the original behaviour exactly
         * (Role.USER). HOST creates an event-manager account.
         */
        private String accountType;
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

        /**
         * Optional, and deliberately NOT sent by the current UI.
         *
         * When present the authenticated account's role must match, so
         * "host email can't sign in as an attendee and vice versa" can be
         * enforced. When absent the role is taken from the database as it
         * always was -- which is what keeps ADMIN logins unaffected, since
         * admins are neither hosts nor attendees.
         */
        private String accountType;
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