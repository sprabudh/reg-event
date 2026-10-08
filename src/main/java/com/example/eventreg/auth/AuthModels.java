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
     * The identity behind the session. Kept as its own object so the client
     * receives { "user": { "role": ..., "name": ... }, "accessToken": ...,
     * "refreshToken": ... } rather than sibling loose keys -- role and name
     * describe the user, the tokens are the credentials.
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
     * Auth responses from /register, /register-admin, /authenticate and /refresh.
     *
     * Serializes as:
     *   { "user": { "role": ..., "name": ... },
     *     "accessToken": "eyJ...", "refreshToken": "eyJ...",
     *     "expiresIn": 900 }
     *
     * accessToken is the short-lived credential sent as `Authorization: Bearer`.
     * refreshToken is long-lived and is only ever posted back to /api/auth/refresh
     * to obtain a fresh pair. expiresIn is the access token's remaining lifetime in
     * seconds, so the client can refresh proactively instead of waiting for a 401.
     *
     * Both stay plain Strings on purpose: each is sent verbatim as a bearer value
     * or as a JSON field, so both must remain scalars.
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonPropertyOrder({ "user", "accessToken", "refreshToken", "expiresIn" })
    public static class AuthenticationResponse {
        private UserInfo user;
        private String accessToken;
        private String refreshToken;

        /** Access-token lifetime in seconds. Advisory: the client may ignore it. */
        private Long expiresIn;
    }

    /** Body of POST /api/auth/refresh. */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RefreshRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    /** Body of POST /api/auth/logout. */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LogoutRequest {
        /**
         * Optional. When supplied, only that session is ended; when omitted every
         * live session for the caller is revoked.
         */
        private String refreshToken;
    }
}