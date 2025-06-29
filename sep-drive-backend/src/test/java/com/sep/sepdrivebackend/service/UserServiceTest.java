package com.sep.sepdrivebackend.service;

import com.sep.sepdrivebackend.dto.LeaderboardDTO;
import com.sep.sepdrivebackend.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.BDDMockito.given;

@ExtendWith(SpringExtension.class)
public class UserServiceTest {
    @MockitoBean
    private UserRepository userRepository;

    @Test
    public void getLeaderboard_all() throws Exception {

        List<LeaderboardDTO> list = new ArrayList<>();
        given(userRepository.getLeaderboard()).willReturn(list);

        UserService service = new UserService(userRepository);

        List<LeaderboardDTO> leaderboard = service.getLeaderboard();
        Assertions.assertEquals(list, leaderboard);
    }
}
