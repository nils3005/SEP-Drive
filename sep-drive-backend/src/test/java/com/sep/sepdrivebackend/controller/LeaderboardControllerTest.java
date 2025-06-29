package com.sep.sepdrivebackend.controller;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.service.HistoryService;
import com.sep.sepdrivebackend.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.BDDMockito.given;

@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
public class LeaderboardControllerTest {
    @MockitoBean
    private UserService userService;

    @MockitoBean
    private HistoryService historyService;

    @Test
    public void getLeaderboard_all() throws Exception {

        List<LeaderboardDTO> list = new ArrayList<>();
        given(userService.getLeaderboard()).willReturn(list);

        LeaderboardController controller = new LeaderboardController(userService, historyService);

        ResponseEntity<List<LeaderboardDTO>> response = controller.getLeaderboard();
        Assertions.assertEquals(list, response.getBody());
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
