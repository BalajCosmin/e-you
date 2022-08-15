package com.example.enviromentalapp.Repository;

import com.example.enviromentalapp.Models.ERole;
import com.example.enviromentalapp.Models.Role;
import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface RoleRepository extends FirestoreReactiveRepository<Role> {

    Flux<Role> findByName(ERole name);
}
