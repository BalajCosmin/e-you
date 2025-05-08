package com.example.enviromentalapp.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class MessageResponse implements Serializable {
    private String response;

    public MessageResponse(String response) {
        this.response = response;
    }
}
