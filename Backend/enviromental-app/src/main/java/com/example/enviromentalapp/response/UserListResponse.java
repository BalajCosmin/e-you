package com.example.enviromentalapp.response;

import com.example.enviromentalapp.models.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class UserListResponse {
    private List<User> data;
    private String error;

    public UserListResponse(List<User> data) {
        this.data = data;
    }

    public UserListResponse(String error) {
        this.error = error;
    }

}
