package com.example.enviromentalapp.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class SolvedIncident implements Serializable {
    private com.example.enviromentalapp.models.Incident incident;
    private List<String> solvedPhotos;
    private List<String> solvedByUsernames;

    public SolvedIncident(com.example.enviromentalapp.models.Incident incident, List<String> solvedBy) {
        this.incident = incident;
        this.solvedByUsernames = solvedBy;
    }
}
