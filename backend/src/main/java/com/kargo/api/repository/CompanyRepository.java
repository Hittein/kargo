package com.kargo.api.repository;

import com.kargo.api.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    List<Company> findByType(String type);
}
