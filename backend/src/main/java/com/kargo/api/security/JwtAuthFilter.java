package com.kargo.api.security;

import com.kargo.api.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwt, UserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        boolean suspendedUserRequest = false;
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwt.parse(token);
                UUID userId = UUID.fromString(claims.getSubject());
                var userOpt = users.findById(userId);
                if (userOpt.isPresent()) {
                    var user = userOpt.get();
                    if ("suspended".equalsIgnoreCase(user.getStatus())) {
                        suspendedUserRequest = true;
                    } else {
                        var auth = new UsernamePasswordAuthenticationToken(user, null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // invalid token → request stays anonymous
            }
        }
        if (suspendedUserRequest) {
            // Le user est identifié mais suspendu → on refuse avant d'entrer dans le
            // filter chain applicatif. Le mobile intercepte 403 {error:"user_suspended"}
            // pour déconnecter + afficher un écran bloquant.
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.setContentType("application/json");
            res.getWriter().write("{\"error\":\"user_suspended\"}");
            res.getWriter().flush();
            return;
        }
        chain.doFilter(req, res);
    }
}
