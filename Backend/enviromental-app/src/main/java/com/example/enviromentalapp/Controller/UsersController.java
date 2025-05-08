package com.example.enviromentalapp.controller;

import com.example.enviromentalapp.models.User;
import com.example.enviromentalapp.models.dtos.UserDTO;
import com.example.enviromentalapp.models.dtos.UserDataDTO;
import com.example.enviromentalapp.response.ListResponse;
import com.example.enviromentalapp.response.LoginResponse;
import com.example.enviromentalapp.response.MessageResponse;
import com.example.enviromentalapp.response.UserListResponse;
import com.example.enviromentalapp.security.jwt.JwtUtils;
import com.example.enviromentalapp.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
@RequestMapping("/users")
public class UsersController {

    private final UsersService usersService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtils jwtTokenUtil;
    @Autowired
    private UserDetailsService jwtInMemoryUserDetailsService;


    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> createUser(@RequestBody User user) {
        if (Boolean.TRUE.equals(usersService.existsByUsername(user.getUsername()))) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        if (Boolean.TRUE.equals(usersService.existsByEmail(user.getEmail()))) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }
        try {
            usersService.addUser(user);
            return ResponseEntity.ok(new MessageResponse("Success"));
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping()
    public ResponseEntity<User> getUser(@RequestParam String documentid) {
        try {
            return ResponseEntity.ok(usersService.getUser(documentid));
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping()
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<String> deleteUser(@RequestParam String documentid) {
        return ResponseEntity.ok(usersService.deleteUser(documentid));
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody UserDTO userDTO) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userDTO.getUsername(), userDTO.getPassword()));

            final UserDetails userDetails = jwtInMemoryUserDetailsService
                    .loadUserByUsername(userDTO.getUsername());

            final String token = jwtTokenUtil.generateJwtToken(new UsernamePasswordAuthenticationToken(userDetails, userDTO));
            UserDataDTO user = usersService.login(userDTO.getUsername(), userDTO.getPassword());
            if (user == null)
                return new LoginResponse("Invalid credentials");
            else
                return new LoginResponse(user, token);
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return new LoginResponse(ResponseEntity.internalServerError().build().toString());
        }
    }

    @GetMapping("/ranking")
    public ResponseEntity<UserListResponse> getRanking(@RequestParam Integer n) {
        try {
            return ResponseEntity.ok(new UserListResponse(usersService.getRanking(n)));
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

}