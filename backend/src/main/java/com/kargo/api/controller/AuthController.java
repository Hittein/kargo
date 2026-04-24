package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.*;
import com.kargo.api.service.ActivityLogger;
import com.kargo.api.service.AuthService;
import com.kargo.api.service.AuthService.VerifyResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService auth;
    private final ActivityLogger activity;

    public AuthController(AuthService auth, ActivityLogger activity) {
        this.auth = auth;
        this.activity = activity;
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
        // Trace login (verify = login dans le modèle OTP). SIGNUP est implicite : le
        // user est créé à sa première verify si le phone n'existait pas encore —
        // on pourrait distinguer via un flag `res.isNew` plus tard.
        activity.record(res.user, "LOGIN", "Connexion via OTP");
        return ResponseEntity.ok(new AuthResponse(res.token, UserDto.of(res.user)));
    }
}
