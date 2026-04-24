package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.*;
import com.kargo.api.model.User;
import com.kargo.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal User principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(UserDto.of(principal));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDto> update(
            @AuthenticationPrincipal User principal,
            @RequestBody UpdateProfileRequest body
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        if (body.name() != null) principal.setName(body.name());
        if (body.email() != null) principal.setEmail(body.email());
        if (body.city() != null) principal.setCity(body.city());
        users.save(principal);
        return ResponseEntity.ok(UserDto.of(principal));
    }
}
