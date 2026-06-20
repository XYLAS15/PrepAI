package com.interviewprep.auth.service;

import com.interviewprep.auth.dto.*;
import com.interviewprep.auth.entity.RefreshToken;
import com.interviewprep.auth.entity.User;
import com.interviewprep.auth.repository.RefreshTokenRepository;
import com.interviewprep.auth.repository.UserRepository;
import com.interviewprep.auth.security.JwtTokenProvider;
import com.interviewprep.common.exception.DuplicateResourceException;
import com.interviewprep.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role("USER")
                .build();

        user = userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        User user = refreshToken.getUser();

        // Rotate refresh token — delete old, issue new
        refreshTokenRepository.delete(refreshToken);

        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole());

        String refreshTokenStr = jwtTokenProvider.generateRefreshToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiryDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                .build();

        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenStr,
                "Bearer",
                jwtTokenProvider.getAccessTokenExpiration() / 1000,
                new AuthResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole()
                )
        );
    }
}
