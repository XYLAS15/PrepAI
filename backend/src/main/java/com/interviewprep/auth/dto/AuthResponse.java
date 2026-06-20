package com.interviewprep.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public record UserInfo(
            UUID id,
            String email,
            String fullName,
            String role
    ) {}
}
