package com.example.enviromentalapp.models.dtos;

import java.util.List;

public class IncidentDTO {
    private String incident_title;
    private String incident_description;
    private String username;
    private double latitude;
    private double longitude;
    private String marker_type;
    private List<String> imageUrls;

    public IncidentDTO() {
    }

    public String getIncident_title() {
        return incident_title;
    }

    public void setIncident_title(String incident_title) {
        this.incident_title = incident_title;
    }

    public String getIncident_description() {
        return incident_description;
    }

    public void setIncident_description(String incident_description) {
        this.incident_description = incident_description;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getMarker_type() {
        return marker_type;
    }

    public void setMarker_type(String marker_type) {
        this.marker_type = marker_type;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}