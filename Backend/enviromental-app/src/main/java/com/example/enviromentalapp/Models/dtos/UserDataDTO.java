package com.example.enviromentalapp.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDataDTO implements Serializable {
    private String birthday;
    private String email;
    private String first_name;
    private String last_name;
    private String gender;
    private String photo_path;
    private String username;
    private String role;
}