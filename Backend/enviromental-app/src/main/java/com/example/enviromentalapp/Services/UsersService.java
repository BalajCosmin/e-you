package com.example.enviromentalapp.services;

import com.example.enviromentalapp.models.Incident;
import com.example.enviromentalapp.models.Role;
import com.example.enviromentalapp.models.User;
import com.example.enviromentalapp.models.dtos.UserDataDTO;
import com.example.enviromentalapp.repository.RoleRepository;
import com.example.enviromentalapp.repository.UserRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class UsersService {
    public static final String USERS_COLLECTION = "Users";
    public static final String SCORE_FIELD = "score";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;


    public UsersService(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder encoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    public String addUser(User user) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        String strRoles = user.getRole();

        if (user.getRole() == null) {
            Role userRole = roleRepository.findByName("ROLE_USER").blockFirst();
            assert userRole != null;
            user.setRole(userRole.getName());
        } else {
            if ("admin".equals(strRoles)) {
                user.setRole("ROLE_ADMIN");
            } else {
                user.setRole("ROLE_USER");
            }
        }
        user.setScore(0);

        ApiFuture<WriteResult> collectionsApiFuture = dbFirestore.collection(USERS_COLLECTION).document(user.getUsername()).set(user);
        dbFirestore.collection(USERS_COLLECTION).document(user.getUsername()).update("password", encoder.encode(user.getPassword()));
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public UserDataDTO login(String documentId, String password) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(USERS_COLLECTION).document(documentId);
        ApiFuture<DocumentSnapshot> future = documentReference.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            User user = document.toObject(User.class);
            assert user != null;
            if (encoder.matches(password, user.getPassword())) {
                return new UserDataDTO(user.getBirthday(), user.getEmail(), user.getFirst_name(), user.getLast_name(), user.getGender(), user.getPhoto_path(), user.getUsername(), user.getRole());
            }
        }
        return null;
    }


    public User getUser(String documentid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(USERS_COLLECTION).document(documentid);
        ApiFuture<DocumentSnapshot> future = documentReference.get();
        DocumentSnapshot document = future.get();
        User user;
        if (document.exists()) {
            user = document.toObject(User.class);
            return user;
        }
        return null;
    }

    public String deleteUser(String documentid) {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        dbFirestore.collection(USERS_COLLECTION).document(documentid).delete();
        return "Successfully deleted " + documentid;
    }

    public List<User> getRanking(Integer n) throws ExecutionException, InterruptedException {
        List<User> users = new ArrayList<>();
        Firestore dbFirestore = FirestoreClient.getFirestore();
        List<QueryDocumentSnapshot> docs = dbFirestore.collection(USERS_COLLECTION).orderBy(SCORE_FIELD, Query.Direction.DESCENDING).limit(n).get().get().getDocuments();
        for (QueryDocumentSnapshot document : docs) {
            User user = document.toObject(User.class);
            users.add(user);
        }

        return users;
    }

    public void updateScoresAfterSolvingIncident(List<String> usernames) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        for (String username : usernames) {
            QueryDocumentSnapshot document = dbFirestore.collection(USERS_COLLECTION).whereEqualTo("username", username).get().get().getDocuments().get(0);
            String documentId = document.getId();
            int score = ((Long) document.getData().get(SCORE_FIELD)).intValue();
            DocumentReference docRef = dbFirestore.collection(USERS_COLLECTION).document(documentId);
            score += 10;
            docRef.update(SCORE_FIELD, score);
        }
    }

    public Boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username).block() != null;
    }

    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email).block() != null;
    }

    public void validateUsernames(List<String> usernames) {
        usernames.removeIf(username -> Boolean.FALSE.equals(userRepository.existsByUsername(username).block()));
    }
}