package com.example.enviromentalapp.models;

import com.google.cloud.firestore.annotation.PropertyName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.cloud.gcp.data.firestore.Document;

import java.io.Serializable;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Document(collectionName = "Incidents")
public class Incident implements Serializable {

    @PropertyName("incident_description")
    private String incident_description;

    @PropertyName("incident_id")
    private String incident_id;


    @PropertyName("incident_title")
    private String incident_title;

    @PropertyName("latitude")
    private String latitude;

    @PropertyName("longitude")
    private String longitude;

    @PropertyName("marker_type")
    private String marker_type;

    @PropertyName("photos")
    private List<String> photos;

    @PropertyName("username")
    private String username;


}
