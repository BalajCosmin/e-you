package com.example.enviromentalapp.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IncidentDTO {

    private String incident_description;
    private String incident_id;
    private String incident_title;
    private String latitude;
    private String longitude;
    private String marker_type;
    private List<String> photos;
    private String username;


}
