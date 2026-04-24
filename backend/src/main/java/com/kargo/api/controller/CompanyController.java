package com.kargo.api.controller;

import com.kargo.api.dto.Dtos.*;
import com.kargo.api.model.Company;
import com.kargo.api.repository.CompanyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyRepository companies;

    public CompanyController(CompanyRepository companies) {
        this.companies = companies;
    }

    @GetMapping
    public List<CompanyDto> all(@RequestParam(required = false) String type) {
        var list = type != null ? companies.findByType(type) : companies.findAll();
        return list.stream().map(CompanyDto::of).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> one(@PathVariable UUID id) {
        return companies.findById(id).map(c -> ResponseEntity.ok(CompanyDto.of(c))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompanyDto> create(@RequestBody CreateCompanyRequest body) {
        Company c = Company.builder()
                .name(body.name())
                .type(body.type())
                .city(body.city())
                .contact(body.contact())
                .logoUrl(body.logoUrl())
                .fleetSize(body.fleetSize() != null ? body.fleetSize() : 0)
                .build();
        return ResponseEntity.ok(CompanyDto.of(companies.save(c)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable UUID id, @RequestBody CreateCompanyRequest body) {
        return companies.findById(id).map(c -> {
            if (body.name() != null) c.setName(body.name());
            if (body.type() != null) c.setType(body.type());
            if (body.city() != null) c.setCity(body.city());
            if (body.contact() != null) c.setContact(body.contact());
            if (body.logoUrl() != null) c.setLogoUrl(body.logoUrl());
            if (body.fleetSize() != null) c.setFleetSize(body.fleetSize());
            return ResponseEntity.ok(CompanyDto.of(companies.save(c)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companies.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
