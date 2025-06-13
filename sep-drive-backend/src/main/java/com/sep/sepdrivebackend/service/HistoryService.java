package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.History;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.HistoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {
    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public List<History> findAllHistory() {
        return historyRepository.findAll();
    }
/*
    public List<Fahrthistorie> findAllHistorien(String sortBy, String sortOrder) {
        return fahrthistorienRepository.findAllSorted(sortBy, sortOrder);
    }
*/
    public History findByHistoryId(Long historyID) {
        return historyRepository.findById(historyID).orElse(null);
    }


    public void save(History history) {
        historyRepository.save(history);
    }

    public List<History> findAllHistory(Sort sort) {
        return historyRepository.findAll(sort);
    }

    public Double getDrivenDistanceForDriverId(Long driverId) {
        return historyRepository.getTotalDrivenDistanceByUserId(driverId);
    }
}
