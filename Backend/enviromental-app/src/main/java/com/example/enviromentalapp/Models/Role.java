package com.example.enviromentalapp.Models;

import com.google.cloud.firestore.annotation.DocumentId;
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

    @DocumentId
    private String name;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}