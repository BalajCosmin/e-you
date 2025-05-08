package com.example.enviromentalapp.models;

import com.google.cloud.firestore.annotation.PropertyName;
import lombok.*;
import org.springframework.cloud.gcp.data.firestore.Document;

@ToString
@EqualsAndHashCode
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(collectionName = "Roles")
public class Role {

    @PropertyName("name")
    private String name;


}