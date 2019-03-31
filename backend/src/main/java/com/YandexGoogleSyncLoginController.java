package com;

import com.model.google.GoogleRepository;
import com.model.google.GoogleUser;
import com.model.principal.YaGoogleUserDetails;
import com.model.user.UserEntity;
import com.model.user.UserRepository;
import com.model.yandex.YandexRepository;
import com.model.yandex.YandexUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@SpringBootApplication
@CrossOrigin
public class YandexGoogleSyncLoginController {

    @Autowired
    private GoogleRepository googleRepository;

    @Autowired
    private YandexRepository yandexRepository;

    @Autowired
    private UserRepository userRepository;

    public static void main (String[] args) {
        SpringApplication.run(YandexGoogleSyncLoginController.class, args);
    }

    @RequestMapping("/login")
    public UserEntity getUser(Principal user) {
        YaGoogleUserDetails userDetails = (YaGoogleUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UserEntity userEntity = userDetails.getUser();
        userEntity.setPassword(null);
        return userEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/saveYandexUserToDB")
    public void saveYandexUserToDB(@RequestBody YandexUser yandexUser) {
        UserEntity userEntity = getCurrentUser();
        if (userEntity != null) {
            YandexUser prevYandexUser = userEntity.getYandexUser();
            if (prevYandexUser == null) {
                prevYandexUser = new YandexUser();
            }
            prevYandexUser.setAccessToken(yandexUser.getAccessToken());
            prevYandexUser.setEmail(yandexUser.getEmail());
            prevYandexUser = yandexRepository.save(prevYandexUser);
            userEntity.setYandexUser(prevYandexUser);
            userRepository.save(userEntity);
        }
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/deleteYandexUser")
    public void deleteYandexUser() {
        UserEntity userEntity = getCurrentUser();
        if (userEntity != null) {
            YandexUser prevYandexUser = userEntity.getYandexUser();
            userEntity.setYandexUser(null);
            userRepository.save(userEntity);
            if (prevYandexUser != null) {
                yandexRepository.delete(prevYandexUser);
            }
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/saveGoogleUserToDB")
    public void saveGoogleUserToDB(@RequestBody GoogleUser googleUser) {
        UserEntity userEntity = getCurrentUser();
        if (userEntity != null) {
            GoogleUser prevGoogleUser = userEntity.getGoogleUser();
            if (prevGoogleUser == null) {
                prevGoogleUser = new GoogleUser();
            }
            prevGoogleUser.setAccessToken(googleUser.getAccessToken());
            prevGoogleUser.setEmail(googleUser.getEmail());
            prevGoogleUser.setAccessTokenExpiration(googleUser.getAccessTokenExpiration());
            prevGoogleUser.setRefreshToken(googleUser.getRefreshToken());
            prevGoogleUser = googleRepository.save(prevGoogleUser);
            userEntity.setGoogleUser(prevGoogleUser);
            userRepository.save(userEntity);
        }
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/deleteGoogleUser")
    public void deleteGoogleUser() {
        UserEntity userEntity = getCurrentUser();
        if (userEntity != null) {
            GoogleUser prevGoogleUser = userEntity.getGoogleUser();
            userEntity.setGoogleUser(null);
            userRepository.save(userEntity);
            if (prevGoogleUser != null) {
                googleRepository.delete(prevGoogleUser);
            }
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/registerUser")
    public ResponseEntity registerUser(@RequestBody UserEntity user) {
        try {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            user.setPassword(encoder.encode(user.getPassword()));
            userRepository.save(user);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private UserEntity getCurrentUser() {
        YaGoogleUserDetails userDetails = (YaGoogleUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Optional<UserEntity> optionalUserEntity = userRepository.findById(userDetails.getUser().getId());
        return optionalUserEntity.orElse(null);
    }
}

