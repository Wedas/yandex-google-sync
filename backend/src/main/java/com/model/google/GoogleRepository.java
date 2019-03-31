package com.model.google;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleRepository extends CrudRepository<GoogleUser, Long> {
}