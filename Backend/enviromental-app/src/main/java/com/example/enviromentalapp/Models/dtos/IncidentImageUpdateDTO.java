package com.example.enviromentalapp.Models.dtos;

import lombok.Data;

import java.util.List;

@Data
public class IncidentImageUpdateDTO {
    private String incidentId;
    private List<String> imageUrls;
}