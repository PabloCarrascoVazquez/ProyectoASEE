package com.subsonic.purchaseservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.concurrent.Executor;

@Configuration
public class HttpClientConfig {

    private static final int TIMEOUT_MILLIS = 3000; // 3 segundos estrictos

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(TIMEOUT_MILLIS));
        factory.setReadTimeout(Duration.ofMillis(TIMEOUT_MILLIS));
        return new RestTemplate(factory);
    }

    @Bean(name = "purchaseTaskExecutor")
    public Executor purchaseTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Purchase-Async-");
        executor.initialize();
        return executor;
    }
}

