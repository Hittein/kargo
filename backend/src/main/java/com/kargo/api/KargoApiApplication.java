package com.kargo.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KargoApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(KargoApiApplication.class, args);
    }
}
