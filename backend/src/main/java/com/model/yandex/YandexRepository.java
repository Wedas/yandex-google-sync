package com.model.yandex;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YandexRepository extends CrudRepository<YandexUser, Long> {
}