package com.example.enviromentalapp.Controller;

import com.example.enviromentalapp.Models.User;
import com.example.enviromentalapp.Services.UsersService;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
public class UsersController {

    private UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping("/adduser")
    public String createUser(@RequestBody User user) throws InterruptedException, ExecutionException {
        return usersService.addUser(user);
    }

    @GetMapping("/getuser")
    public User getUser(@RequestParam String documentid) throws InterruptedException, ExecutionException {
        return usersService.getUser(documentid);
    }

    @DeleteMapping("/deleteuser")
    public String deleteUser(@RequestParam String documentid) throws InterruptedException, ExecutionException {
        return usersService.deleteUser(documentid);
    }
}
