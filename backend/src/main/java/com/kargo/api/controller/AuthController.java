package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.*;
import com.kargo.api.service.AuthService;
import com.kargo.api.service.AuthService.VerifyResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/start")
    public ResponseEntity<?> start(@RequestBody StartOtpRequest body) {
        if (body.phone() == null || body.phone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "phone_required"));
        }
        AuthService.StartResult res = auth.start(body.phone());
        return ResponseEntity.ok(Map.of(
                "challengeId", res.challengeId(),
                "simulatedCode", res.simulatedCode()
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyOtpRequest body) {
        if (body.phone() == null || body.code() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "missing_fields"));
        }
        VerifyResult res = auth.verify(body.phone(), body.code());
        if (!res.ok) {
            return ResponseEntity.status(401).body(Map.of("error", res.reason));
        }
        return ResponseEntity.ok(new AuthResponse(res.token, UserDto.of(res.user)));
    }
}
