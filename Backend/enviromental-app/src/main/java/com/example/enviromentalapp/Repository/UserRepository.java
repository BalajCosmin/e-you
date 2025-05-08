package com.example.enviromentalapp.repository;

import com.example.enviromentalapp.models.User;
import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends FirestoreReactiveRepository<User> {

    Flux<User> findByUsername(String username);

    Mono<Boolean> existsByUsername(String s);

    Mono<Boolean> existsByEmail(String s);
}
