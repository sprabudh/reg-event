package com.example.eventreg.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;


    @Value("${application.security.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Normal login and user registration are public
                        .requestMatchers("/api/auth/authenticate", "/api/auth/register").permitAll()

                        // Session endpoints. /refresh must be public: the access
                        // token has expired by the time it is called, so the
                        // refresh token is the only credential available. /logout
                        // is public so it still works when the access token has
                        // already died.
                        .requestMatchers("/api/auth/refresh", "/api/auth/logout").permitAll()

                        // --- Host role ---
                        // Authorities are unprefixed (User.getAuthorities uses
                        // role.name()), so this is hasAuthority("HOST"), not
                        // hasRole("HOST") -- the latter would look for a
                        // "ROLE_HOST" authority and match nothing.
                        // Placed above anyRequest() so it wins.
                        .requestMatchers("/api/host/**").hasAuthority("HOST")

                        // --- Admin approval queue (new /api/admin/** namespace) ---
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // --- VULNERABILITY FIXED ---
                        // Only an EXISTING Admin can create a new Admin!
                        .requestMatchers("/api/auth/register-admin").hasAuthority("ADMIN")

                        // Allow ANY authenticated user to register for an event
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/attendees").authenticated()

                        // Category management is admin-only. Without these the
                        // requests fell through to anyRequest().authenticated()
                        // below, so any logged-in attendee could create/delete
                        // categories even though the UI hides it from them.
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/categories").hasAuthority("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/categories/**").hasAuthority("ADMIN")

                        // Only Admins can Create, Update, or Delete Events
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/**").hasAuthority("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/events/**").hasAuthority("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/**").hasAuthority("ADMIN")

                        // Attendee edits are open to any logged-in user, but AttendeeService
                        // enforces that a non-admin may only edit their OWN registration
                        // (email match, not checked in, and email itself is immutable).
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/attendees/**").authenticated()

                        // Payment/refund data is admin-only
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/*/payments").hasAuthority("ADMIN")

                        // Everyone else who is logged in can view events and attendees
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Without an entry point Spring answers 403 for an unauthenticated
                // request, which is indistinguishable from "signed in but not
                // allowed". 401 + a JSON body lets the frontend tell the two
                // apart and clear the dead session.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler())
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.security.web.AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) -> writeError(response, 401, "Authentication required.");
    }

    @Bean
    public org.springframework.security.web.access.AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, accessDeniedException) ->
                writeError(response, 403, "You do not have permission to perform this action.");
    }

    /** Same {status, message} envelope the GlobalExceptionHandler uses. */
    private void writeError(jakarta.servlet.http.HttpServletResponse response, int status, String message)
            throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}