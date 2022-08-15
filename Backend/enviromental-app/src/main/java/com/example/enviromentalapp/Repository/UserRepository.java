package com.example.enviromentalapp.Repository;

import com.example.enviromentalapp.Models.User;
import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends FirestoreReactiveRepository<User> {

    User findByUsername(String username);
}
