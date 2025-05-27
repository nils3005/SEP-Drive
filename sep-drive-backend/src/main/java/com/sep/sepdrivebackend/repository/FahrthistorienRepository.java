package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.Fahrthistorie;
import com.sep.sepdrivebackend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FahrthistorienRepository extends JpaRepository<Fahrthistorie, Long> {
/*
    @Query("SELECT h FROM Fahrthistorie h ORDER BY :sortBy")
    List<Fahrthistorie> findAllSorted(String sortBy, String sortOrder);
*/
}
