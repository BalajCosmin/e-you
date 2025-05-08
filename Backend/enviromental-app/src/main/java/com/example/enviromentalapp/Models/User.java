package com.example.enviromentalapp.models;

import com.google.cloud.firestore.annotation.PropertyName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.cloud.gcp.data.firestore.Document;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document(collectionName = "Users")
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 5926468583005150707L;

    @PropertyName("document_id")
    private String document_id;

    @PropertyName("birthday")
    private String birthday;

    @PropertyName("email")
    private String email;

    @PropertyName("first_name")
    private String first_name;

    @PropertyName("last_name")
    private String last_name;

    @PropertyName("gender")
    private String gender;

    @PropertyName("password")
    private String password;

    @PropertyName("photo_path")
    private String photo_path;

    @PropertyName("username")
    private String username;

    @PropertyName("role")
    private String role;

    @PropertyName("score")
    private Integer score;


}
