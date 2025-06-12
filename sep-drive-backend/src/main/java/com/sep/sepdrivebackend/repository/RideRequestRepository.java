package com.sep.sepdrivebackend.repository;

import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.entities.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    List<RideRequest> findByCustomer(User customer);
    List<RideRequest> findByCustomerAndActiveTrue(User customer);
    Optional<RideRequest> findByCustomerIdAndActiveTrue(Long customerId);


    List<RideRequest> findByActiveTrue();

}
