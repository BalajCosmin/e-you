package com.example.enviromentalapp.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class IncidentDocumentModel {

    private String documentId;
    Incident incident;
}
