package org.bahikhata.xpense.controller;

import org.bahikhata.xpense.dto.UserResponse;
import org.bahikhata.xpense.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@Tag(name = "Users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public UserResponse getUser() {
        return userService.getUser();
    }
}
