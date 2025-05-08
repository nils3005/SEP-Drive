package com.sep.sepdrivebackend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    List<RideRequest> findByCustomer(DriveUser customer);
    List<RideRequest> findByCustomerAndActiveTrue(DriveUser customer);
    Optional<RideRequest> findByCustomerUseridAndActiveTrue(Long customerId);
}
