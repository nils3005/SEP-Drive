package com.sep.sepdrivebackend.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    /**
     * Registriert den Endpunkt über den sich Clients verbinden
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Diese URL brauchen die Angular-Clients, um die WS-Verbindung aufzubauen
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost")
                .withSockJS();
    }

    /**
     * Konfiguriert den Message-Broker:
     *   Client sendet an /app/whatever
     *   Server publisht an /topic/...
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");         // Prefix für eingehende Nachrichten vom Client
        registry.enableSimpleBroker("/topic");    // Prefix für Broadcasts vom Server zum Client
    }
}
