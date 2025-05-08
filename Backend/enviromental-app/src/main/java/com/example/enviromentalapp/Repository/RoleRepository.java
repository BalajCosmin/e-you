package com.example.enviromentalapp.repository;

import com.example.enviromentalapp.models.Role;
import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface RoleRepository extends FirestoreReactiveRepository<Role> {

    Flux<Role> findByName(String name);
}
