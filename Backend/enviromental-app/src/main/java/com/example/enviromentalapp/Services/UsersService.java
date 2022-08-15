package com.example.enviromentalapp.Services;

import com.example.enviromentalapp.Models.ERole;
import com.example.enviromentalapp.Models.Role;
import com.example.enviromentalapp.Models.User;
import com.example.enviromentalapp.Repository.RoleRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class UsersService {
    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    public String addUser(User user) throws ExecutionException, InterruptedException {

        Firestore dbFirestore = FirestoreClient.getFirestore();
        List<Role> roles = new ArrayList<>();
        List<Role> strRoles = user.getRoles();


        if (user.getRoles() == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER).blockFirst();

            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toString()) {
                    case "admin":
                        Role adminRole = new Role("ADMIN");
                        roles.add(adminRole);

                        break;
                    default:
                        Role userRole = new Role("USER");
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        ApiFuture<WriteResult> collectionsApiFuture = dbFirestore.collection("Users").document(user.getUsername()).set(user);
        ApiFuture<WriteResult> collectionsApiFuturUpdate = dbFirestore.collection("Users").document(user.getUsername()).update("roles.0.name", roles.get(0).getName(), "password", encoder.encode(user.getPassword()));
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public User getUser(String documentid) throws ExecutionException, InterruptedException {

        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection("Users").document(documentid);
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
        ApiFuture<WriteResult> writeResult = dbFirestore.collection("Users").document(documentid).delete();
        return "Successfully deleted " + documentid;
    }
}
