package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.entities.Role;
import com.sep.sepdrivebackend.entities.User;
import com.sep.sepdrivebackend.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.BDDMockito.given;

@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
public class UserControllerTest {

    @MockBean
    private UserService userService;

    static class PartialUserController extends UserController {

        private final String currentUser;

        public PartialUserController(UserService userService, String currentUser) {
            super(userService);

            this.currentUser = currentUser;
        }

        protected String getCurrentUserName() {
            return currentUser;
        }
    }

    @Test
    public void disburse_unknownUser() throws Exception {

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        try {

            userController.disburse(10);
            Assertions.fail();

        } catch (Throwable t) {

            Assertions.assertInstanceOf(ResponseStatusException.class, t);
            ResponseStatusException e = (ResponseStatusException) t;
            Assertions.assertEquals(HttpStatus.NOT_FOUND, e.getStatusCode());
            Assertions.assertEquals("Username not found.", e.getReason());
        }
    }

    @Test
    public void disburse_notDriver() throws Exception {

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setBalance(100.0);
        user.setIban("DE12345678901234567890");
        user.setRole(Role.CUSTOMER);

        given(userService.findByUsername("sheldon_cooper")).willReturn(user);
        try {

            userController.disburse(10);
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

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setBalance(100.0);
        user.setRole(Role.DRIVER);

        given(userService.findByUsername("sheldon_cooper")).willReturn(user);
        try {

            userController.disburse(10);
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

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setBalance(100.0);
        user.setIban("DE12345678901234567890");
        user.setRole(Role.DRIVER);

        given(userService.findByUsername("sheldon_cooper")).willReturn(user);
        try {

            userController.disburse(-10);
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

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setBalance(100.0);
        user.setIban("DE12345678901234567890");
        user.setRole(Role.DRIVER);

        given(userService.findByUsername("sheldon_cooper")).willReturn(user);
        try {

            userController.disburse(100.1);
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

        UserController userController = new PartialUserController(
                userService,
                "sheldon_cooper");

        User user = new User();
        user.setUsername("sheldon_cooper");
        user.setIban("DE12345678901234567890");
        user.setBalance(100.0);
        user.setRole(Role.DRIVER);

        given(userService.findByUsername("sheldon_cooper")).willReturn(user);
        String result = userController.disburse(10);
        Assertions.assertEquals("Payment disbursed succesfully.", result);
        Assertions.assertEquals(90.0, user.getBalance());
    }
}
