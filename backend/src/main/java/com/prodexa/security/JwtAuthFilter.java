package com.prodexa.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${jwt.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.validateToken(token, userDetails)) {
                        // Extract roles from token claims directly
                        Key key = Keys.hmacShaKeyFor(secret.getBytes());
                        Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                                .parseClaimsJws(token).getBody();

                        String rolesStr = claims.get("roles", String.class);
                        List<SimpleGrantedAuthority> authorities;

                        if (rolesStr != null && !rolesStr.isEmpty()) {
                            authorities = Arrays.stream(rolesStr.split(","))
                                    .map(String::trim)
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toList());
                        } else {
                            // Fallback to UserDetails authorities
                            authorities = userDetails.getAuthorities().stream()
                                    .map(a -> new SimpleGrantedAuthority(a.getAuthority()))
                                    .collect(Collectors.toList());
                        }

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(request, response);
    }
}
