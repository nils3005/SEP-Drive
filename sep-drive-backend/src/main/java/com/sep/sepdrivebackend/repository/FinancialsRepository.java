package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.Financials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancialsRepository extends JpaRepository<Financials, Long> {
}
