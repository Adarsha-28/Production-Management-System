package com.prodexa.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Handle Hibernate lazy proxies — serialize as null instead of throwing
        Hibernate6Module hibernateModule = new Hibernate6Module();
        hibernateModule.disable(Hibernate6Module.Feature.USE_TRANSIENT_ANNOTATION);
        mapper.registerModule(hibernateModule);
        // Handle Java 8 date/time types
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
