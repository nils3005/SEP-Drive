package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.Financials;
import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.FinancialsService;
import com.sep.sepdrivebackend.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.BDDMockito.given;

@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
public class FinancialsControllerTest {

    @MockitoBean
    private FinancialsService financialsService;

    @MockitoBean
    private UserService userService;

    @Test
    public void disburse_notDriver() throws Exception {

        Financials financials = new Financials();
        financials.setBalance(100.0);
        financials.setIban("DE12345678901234567890");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setRole(Role.CUSTOMER);
        user.setFinancials(financials);

        given(userService.getCurrentUser()).willReturn(user);

        FinancialsController financialsController = new FinancialsController(userService, financialsService);

        try {

            financialsController.disburse(10);
            Assertions.fail();

        } catch (Throwable t) {

            Assertions.assertInstanceOf(ResponseStatusException.class, t);
            ResponseStatusException e = (ResponseStatusException) t;
            Assertions.assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
            Assertions.assertEquals("User is no driver.", e.getReason());
        }
    }

    @Test
    public void disburse_noIBAN() throws Exception {

        Financials financials = new Financials();
        financials.setBalance(100.0);
        financials.setIban(null);

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setRole(Role.DRIVER);
        user.setFinancials(financials);

        given(userService.getCurrentUser()).willReturn(user);

        FinancialsController financialsController = new FinancialsController(userService, financialsService);

        try {

            financialsController.disburse(10);
            Assertions.fail();

        } catch (Throwable t) {

            Assertions.assertInstanceOf(ResponseStatusException.class, t);
            ResponseStatusException e = (ResponseStatusException) t;
            Assertions.assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
            Assertions.assertEquals("IBAN not set.", e.getReason());
        }
    }

    @Test
    public void disburse_negativeAmount() throws Exception {

        Financials financials = new Financials();
        financials.setBalance(100.0);
        financials.setIban("DE12345678901234567890");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setRole(Role.DRIVER);
        user.setFinancials(financials);

        given(userService.getCurrentUser()).willReturn(user);

        FinancialsController financialsController = new FinancialsController(userService, financialsService);

        try {

            financialsController.disburse(-10);
            Assertions.fail();

        } catch (Throwable t) {

            Assertions.assertInstanceOf(ResponseStatusException.class, t);
            ResponseStatusException e = (ResponseStatusException) t;
            Assertions.assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
            Assertions.assertEquals("Amount too small.", e.getReason());
        }
    }

    @Test
    public void disburse_noBalance() throws Exception {

        Financials financials = new Financials();
        financials.setBalance(100.0);
        financials.setIban("DE12345678901234567890");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setRole(Role.DRIVER);
        user.setFinancials(financials);

        given(userService.getCurrentUser()).willReturn(user);

        FinancialsController financialsController = new FinancialsController(userService, financialsService);

        try {

            financialsController.disburse(100.1);
            Assertions.fail();

        } catch (Throwable t) {

            Assertions.assertInstanceOf(ResponseStatusException.class, t);
            ResponseStatusException e = (ResponseStatusException) t;
            Assertions.assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
            Assertions.assertEquals("Amount too big, Balance too small.", e.getReason());
        }
    }

    @Test
    public void disburse_vanilla() throws Exception {

        Financials financials = new Financials();
        financials.setBalance(100.0);
        financials.setIban("DE12345678901234567890");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setRole(Role.DRIVER);
        user.setFinancials(financials);

        given(userService.getCurrentUser()).willReturn(user);

        FinancialsController financialsController = new FinancialsController(userService, financialsService);

        String result = financialsController.disburse(10);
        Assertions.assertEquals("Payment disbursed successfully.", result);
        Assertions.assertEquals(90.0, financials.getBalance());
    }
}
