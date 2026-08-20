package com.example.eventreg.security;

import lombok.RequiredArgsConstructor;
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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Normal login and user registration are public
                        .requestMatchers("/api/auth/authenticate", "/api/auth/register").permitAll()

                        // --- VULNERABILITY FIXED ---
                        // Only an EXISTING Admin can create a new Admin!
                        .requestMatchers("/api/auth/register-admin").hasAuthority("ADMIN")

                        // Allow ANY authenticated user to register for an event
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/attendees").authenticated()

                        // Only Admins can Create, Update, or Delete Events
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/**").hasAuthority("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/events/**").hasAuthority("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/**").hasAuthority("ADMIN")

                        // Admins only for editing attendees
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/attendees/**").hasAuthority("ADMIN")

                        // Everyone else who is logged in can view events and attendees
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}