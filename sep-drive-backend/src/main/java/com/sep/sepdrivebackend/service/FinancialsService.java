package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.entities.Financials;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.repository.FinancialsRepository;
import org.springframework.stereotype.Service;

@Service
public class FinancialsService {
    private final FinancialsRepository financialsRepository;
    private final UserService userService;

    public FinancialsService(FinancialsRepository financialsRepository, UserService userService) {
        this.financialsRepository = financialsRepository;
        this.userService = userService;
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
            Financials financials = new Financials();
            financials.setBalance(0.0);
            sender.setFinancials(financials);
            userService.save(sender);
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
            Financials financials = new Financials();
            financials.setBalance(0.0);
            receiver.setFinancials(financials);
            userService.save(receiver);
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
