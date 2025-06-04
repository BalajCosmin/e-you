package com.example.enviromentalapp.Models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class IncidentDocumentModel {

    private String documentId;
    com.example.enviromentalapp.models.Incident incident;
}
