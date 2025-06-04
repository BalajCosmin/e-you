package com.example.enviromentalapp.response;

import com.example.enviromentalapp.Models.IncidentDocumentModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class IncidentsResponse {

    private List<IncidentDocumentModel> data;
    private String error;


    public IncidentsResponse(List<IncidentDocumentModel> response) {
        this.data = response;
        this.error = "No error occured";
    }

    public IncidentsResponse(String error) {
        this.error = error;
    }

}
