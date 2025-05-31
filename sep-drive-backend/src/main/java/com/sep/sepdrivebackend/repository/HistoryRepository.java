package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
/*
    @Query("SELECT h FROM Fahrthistorie h ORDER BY :sortBy")
    List<Fahrthistorie> findAllSorted(String sortBy, String sortOrder);
*/
}
