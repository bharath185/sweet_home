package com.eteks.sweethome3d.spring.repository;

import com.eteks.sweethome3d.spring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByIsOnlineTrue();
    List<UserEntity> findByRole(String role);
}
