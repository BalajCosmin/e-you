package com.example.enviromentalapp.Services;

import com.example.enviromentalapp.models.dtos.IncidentDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class IncidentService {

    private static final String COLLECTION_NAME = "incidents";

    public String addIncident(IncidentDTO incidentDTO) {
        try {
            Firestore dbFirestore = FirestoreClient.getFirestore();
            // Generate ID for the new incident
            String documentId = dbFirestore.collection(COLLECTION_NAME).document().getId();

            // Create a map for the incident data
            Map<String, Object> data = new HashMap<>();
            data.put("incident_title", incidentDTO.getIncident_title());
            data.put("incident_description", incidentDTO.getIncident_description());
            data.put("username", incidentDTO.getUsername());
            data.put("latitude", incidentDTO.getLatitude());
            data.put("longitude", incidentDTO.getLongitude());
            data.put("marker_type", incidentDTO.getMarker_type());
            data.put("created_at", System.currentTimeMillis());

            // Add empty image URLs array if not provided
            if (incidentDTO.getImageUrls() != null) {
                data.put("imageUrls", incidentDTO.getImageUrls());
            } else {
                data.put("imageUrls", new ArrayList<String>());
            }

            // Set data with the generated ID
            dbFirestore.collection(COLLECTION_NAME).document(documentId).set(data);

            return documentId;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error adding incident: " + e.getMessage();
        }
    }

    public List<Map<String, Object>> getAllMarkers() throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        CollectionReference incidents = dbFirestore.collection(COLLECTION_NAME);

        ApiFuture<QuerySnapshot> future = incidents.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Map<String, Object>> allIncidents = new ArrayList<>();

        for (DocumentSnapshot document : documents) {
            Map<String, Object> documentData = document.getData();
            Map<String, Object> incident = new HashMap<>();

            // Copy incident data
            if (documentData != null) {
                incident.putAll(documentData);

                // Add document ID to the data
                incident.put("id", document.getId());

                Map<String, Object> data = new HashMap<>();
                data.put("incident", incident);
                allIncidents.add(data);
            }
        }
        return allIncidents;
    }

    public Boolean existsById(String id) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference docRef = dbFirestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        return document.exists();
    }

    public String updateIncidentImages(String incidentId, List<String> imageUrls) throws ExecutionException, InterruptedException {
        if (!existsById(incidentId)) {
            return "Incident not found";
        }

        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference docRef = dbFirestore.collection(COLLECTION_NAME).document(incidentId);

        // Update only the imageUrls field
        Map<String, Object> updates = new HashMap<>();
        updates.put("imageUrls", imageUrls);
        updates.put("updated_at", System.currentTimeMillis());

        // Update the document
        ApiFuture<WriteResult> writeResult = docRef.update(updates);

        return "Updated incident images: " + writeResult.get().getUpdateTime().toString();
    }

    public String solveIncident(List<String> usernames, String incidentId) throws ExecutionException, InterruptedException {
        if (!existsById(incidentId)) {
            return "Incident not found";
        }

        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference docRef = dbFirestore.collection(COLLECTION_NAME).document(incidentId);

        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "solved");
        updates.put("solvers", usernames);
        updates.put("solved_at", System.currentTimeMillis());

        ApiFuture<WriteResult> writeResult = docRef.update(updates);

        return incidentId;
    }
}