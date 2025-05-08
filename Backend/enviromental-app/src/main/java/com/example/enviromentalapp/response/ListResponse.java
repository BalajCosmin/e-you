package com.example.enviromentalapp.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ListResponse {

    private List<String> data;
    private String error;

    public ListResponse(List<String> responseList) {
        this.data = responseList;
        this.error = "No error occured";
    }

    public ListResponse(String error) {
        this.error = error;
    }
}
