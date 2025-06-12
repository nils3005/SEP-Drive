package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.Financials;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.FinancialsRepository;
import org.springframework.stereotype.Service;

@Service
public class FinancialsService {
    private final FinancialsRepository financialsRepository;

    public FinancialsService(FinancialsRepository financialsRepository) {
        this.financialsRepository = financialsRepository;
    }

    public void transfer(User sender, User receiver, double amount) {

        if (amount <= 0) {
            throw new IllegalArgumentException("Amount too small.");
        }
        if (sender == null) {
            throw new IllegalArgumentException("Sender not found.");
        }
        if(sender.getRole()!= Role.CUSTOMER) {
            throw new IllegalArgumentException("Sender is no customer.");
        }
        Financials senderFinancials = sender.getFinancials();
        if (null == senderFinancials) {
            throw new IllegalArgumentException("Sender's money is null.");
        }
        if (senderFinancials.getBalance() == null || amount > senderFinancials.getBalance()) {
            throw new IllegalArgumentException("Amount too big, Balance too small.");
        }

        if (receiver == null) {
            throw new IllegalArgumentException("Receiver not found.");
        }
        if (receiver.getRole() != Role.DRIVER) {
            throw new IllegalArgumentException("Receiver is no driver.");
        }
        Financials receiverFinancials = receiver.getFinancials();
        if (null == receiverFinancials) {
            throw new IllegalArgumentException("Receiver's money is null.");
        }

        senderFinancials.setBalance(senderFinancials.getBalance() - amount);
        Double balance = receiverFinancials.getBalance();
        if (balance == null) {
            balance = 0.0;
        }
        receiverFinancials.setBalance(balance + amount);

        save(receiverFinancials);
        save(senderFinancials);
    }

    public void save(Financials financials) {
        financialsRepository.save(financials);
    }
}
