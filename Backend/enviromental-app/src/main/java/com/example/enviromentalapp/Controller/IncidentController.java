package com.example.enviromentalapp.Controller;

import com.example.enviromentalapp.Models.dtos.IncidentImageUpdateDTO;
import com.example.enviromentalapp.models.dtos.IncidentDTO;
import com.example.enviromentalapp.models.dtos.SolvedIncidentDTO;
import com.example.enviromentalapp.response.IncidentsResponse;
import com.example.enviromentalapp.response.MessageResponse;
import com.example.enviromentalapp.Services.IncidentService;
import com.example.enviromentalapp.services.UsersService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
public class IncidentController {

    private final IncidentService incidentService;
    private final UsersService usersService;

    public IncidentController(IncidentService incidentService, UsersService usersService) {
        this.incidentService = incidentService;
        this.usersService = usersService;
    }

    @PostMapping("/incidents/add")
    public ResponseEntity<MessageResponse> createIncident(@RequestBody IncidentDTO incidentDTO) {
        return ResponseEntity.ok(new MessageResponse(incidentService.addIncident(incidentDTO)));
    }

    @GetMapping("/incidents/get")
    public ResponseEntity<?> getAllIncidents(@RequestParam(required = false) String status) {
        try {
            List<Map<String, Object>> markers;

            if (status != null && !status.isEmpty()) {
                markers = incidentService.getMarkersByStatus(status);
            } else {
                markers = incidentService.getAllMarkers();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("data", markers);
            return ResponseEntity.ok(response);
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch incidents");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/incidents/solve")
    public ResponseEntity<MessageResponse> solveIncident(@RequestBody SolvedIncidentDTO solvedIncidentDTO) {
        try {
            if (Boolean.FALSE.equals(incidentService.existsById(solvedIncidentDTO.getIncidentId()))) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Incident does not exist!"));
            }
            usersService.validateUsernames(solvedIncidentDTO.getUsernames());
            if (!solvedIncidentDTO.getUsernames().isEmpty()) {
                String docId = incidentService.solveIncident(solvedIncidentDTO.getUsernames(), solvedIncidentDTO.getIncidentId());
                usersService.updateScoresAfterSolvingIncident(solvedIncidentDTO.getUsernames());
                return ResponseEntity.ok(new MessageResponse("Success: " + docId));
            } else {
                return ResponseEntity.ok(new MessageResponse("Error: Invalid users"));
            }
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/incidents/update-images")
    public ResponseEntity<MessageResponse> updateIncidentImages(@RequestBody IncidentImageUpdateDTO updateDTO) {
        try {
            if (Boolean.FALSE.equals(incidentService.existsById(updateDTO.getIncidentId()))) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Incident does not exist!"));
            }

            String result = incidentService.updateIncidentImages(updateDTO.getIncidentId(), updateDTO.getImageUrls());
            return ResponseEntity.ok(new MessageResponse("Success: " + result));
        } catch (ExecutionException | InterruptedException e) {
            Thread.currentThread().interrupt();
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse(e.getMessage()));
        }
    }
}