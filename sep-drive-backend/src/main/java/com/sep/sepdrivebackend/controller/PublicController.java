package com.sep.sepdrivebackend.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {
    @GetMapping("/")
    public String home() {
        return "Welcome! This is a public page.";
    }
}