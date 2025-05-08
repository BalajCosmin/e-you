package com.example.enviromentalapp.response;

import com.example.enviromentalapp.models.dtos.UserDataDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse implements Serializable {

    private String jwt;
    private UserDataDTO data;
    private String error;


    public LoginResponse(UserDataDTO response, String jwt) {
        this.data = response;
        this.jwt = jwt;
        this.error = "No error occured";
    }

    public LoginResponse(String error) {
        this.error = error;
    }

}
