package com.example.eventreg.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * Mints the two credentials used by the refresh-token flow:
 *
 *   access token  -- short-lived (default 15 min), sent on every API call as
 *                    `Authorization: Bearer ...`.
 *   refresh token -- long-lived (default 7 days), never sent to business
 *                    endpoints. Only exchanged at /api/auth/refresh for a new pair.
 *
 * Both carry a "typ" claim (ACCESS / REFRESH). Without it a stolen refresh token
 * would be accepted as a bearer credential against the whole API until it
 * expired, which is exactly the exposure a refresh token is meant to avoid.
 */
@Service
public class JwtService {

    public static final String TYPE_ACCESS = "ACCESS";
    public static final String TYPE_REFRESH = "REFRESH";

    private static final String CLAIM_TYPE = "typ";

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    /** Access token lifetime. Deliberately short so a leaked one dies quickly. */
    @Value("${application.security.jwt.access-expiration:900000}")
    private long accessExpiration;

    /** Refresh token lifetime. */
    @Value("${application.security.jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    /** Refresh token lifetime in millis, so the caller can set the DB expiry. */
    public long getRefreshExpirationMillis() {
        return refreshExpiration;
    }

    /** Access token lifetime in seconds, for the client's expiresIn field. */
    public long getAccessExpirationSeconds() {
        return accessExpiration / 1000L;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /** Short-lived credential for API calls. */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TYPE_ACCESS);
        return generateToken(claims, userDetails.getUsername(), accessExpiration);
    }

    /**
     * Long-lived credential, exchangeable only at /api/auth/refresh.
     *
     * Carries a jti so two refresh tokens minted in the same millisecond for the
     * same user are still distinct values, which keeps rotation unambiguous.
     */
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TYPE_REFRESH);
        claims.put("jti", UUID.randomUUID().toString());
        return generateToken(claims, userDetails.getUsername(), refreshExpiration);
    }

    private String generateToken(Map<String, Object> extraClaims, String subject, long ttlMillis) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMillis))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * True when the token is well-formed, unexpired, and of the expected type.
     *
     * Returns false rather than throwing so callers can treat "wrong kind of
     * token" as simply not authenticated -- a refresh token presented to a
     * business endpoint should be refused, not blow up as a 500.
     */
    public boolean isTokenValid(String token, UserDetails userDetails, String expectedType) {
        try {
            Claims claims = extractAllClaims(token);
            String username = claims.getSubject();
            String type = claims.get(CLAIM_TYPE, String.class);
            Date expiry = claims.getExpiration();

            boolean unexpired = expiry != null && expiry.after(new Date());
            return unexpired
                    && expectedType.equals(type)
                    && username != null
                    && username.equals(userDetails.getUsername());
        } catch (Exception ex) {
            // Expired, tampered, or unparseable.
            return false;
        }
    }

    /** True when the token parses and has not expired, regardless of its type. */
    public boolean isTokenUsable(String token) {
        try {
            Date expiry = extractAllClaims(token).getExpiration();
            return expiry != null && expiry.after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
