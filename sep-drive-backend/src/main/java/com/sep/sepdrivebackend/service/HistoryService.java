package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.Fahrthistorie;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.FahrthistorienRepository;
import com.sep.sepdrivebackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FahrthistorienService {
    private final FahrthistorienRepository fahrthistorienRepository;

    public FahrthistorienService(FahrthistorienRepository fahrthistorienRepository) {
        this.fahrthistorienRepository = fahrthistorienRepository;
    }

    public List<Fahrthistorie> findAllHistorien() {
        return fahrthistorienRepository.findAll();
    }
/*
    public List<Fahrthistorie> findAllHistorien(String sortBy, String sortOrder) {
        return fahrthistorienRepository.findAllSorted(sortBy, sortOrder);
    }
*/
    public void save(Fahrthistorie fahrthistorie) {
        fahrthistorienRepository.save(fahrthistorie);
    }

}
