package com.example.enviromentalapp.services;

import com.example.enviromentalapp.models.Incident;
import com.example.enviromentalapp.models.IncidentDocumentModel;
import com.example.enviromentalapp.models.SolvedIncident;
import com.example.enviromentalapp.models.dtos.IncidentDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class IncidentService {
    public static final String INCIDENTS_COLLECTION = "Incidents";
    public static final String SOLVED_INCIDENTS_COLLECTION = "SolvedIncidents";


    public String addIncident(IncidentDTO incident) {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        LocalDateTime localDateTime = LocalDateTime.now();
        String creationDateTime = String.valueOf(localDateTime);
        dbFirestore.collection(INCIDENTS_COLLECTION).document(creationDateTime).set(incident);
        dbFirestore.collection(INCIDENTS_COLLECTION).document(creationDateTime).update("incident_id", creationDateTime);
        return localDateTime.toString();
    }


    public List<IncidentDocumentModel> getAllMarkers() throws ExecutionException, InterruptedException {
        List<IncidentDocumentModel> incidentList = new ArrayList<>();
        Firestore dbFirestore = FirestoreClient.getFirestore();
        CollectionReference documentReference = dbFirestore.collection(INCIDENTS_COLLECTION);
        ApiFuture<QuerySnapshot> future = documentReference.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        for (QueryDocumentSnapshot document : documents) {
            incidentList.add(new IncidentDocumentModel(document.getId(), document.toObject(Incident.class)));
        }
        return incidentList;
    }

    public String solveIncident(List<String> usernames, String incidentDocumentId) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        Incident incident = dbFirestore.collection(INCIDENTS_COLLECTION).document(incidentDocumentId).get().get().toObject(Incident.class);
        dbFirestore.collection(INCIDENTS_COLLECTION).document(incidentDocumentId).delete();

        String docId = LocalDateTime.now().toString();
        SolvedIncident solvedIncident = new SolvedIncident(incident, usernames);
        dbFirestore.collection(SOLVED_INCIDENTS_COLLECTION).document(docId).set(solvedIncident);
        return docId;
    }

    public Boolean existsById(String documentId) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        Incident incident = dbFirestore.collection(INCIDENTS_COLLECTION).document(documentId).get().get().toObject(Incident.class);
        return incident != null;
    }
}