package com.subsonic.purchaseservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "subsonic.purchases.exchange";
    public static final String TICKET_QUEUE = "ticket_queue";
    public static final String MERCH_QUEUE = "merch_queue";
    public static final String ROUTING_KEY_TICKET = "order.ticket";
    public static final String ROUTING_KEY_MERCH = "order.merch";

    @Value("${spring.rabbitmq.host:localhost}")
    private String rabbitHost;

    @Value("${spring.rabbitmq.port:5672}")
    private int rabbitPort;

    @Value("${spring.rabbitmq.username:guest}")
    private String rabbitUsername;

    @Value("${spring.rabbitmq.password:guest}")
    private String rabbitPassword;

    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
        connectionFactory.setHost(rabbitHost);
        connectionFactory.setPort(rabbitPort);
        connectionFactory.setUsername(rabbitUsername);
        connectionFactory.setPassword(rabbitPassword);
        connectionFactory.setConnectionTimeout(3000);
        return connectionFactory;
    }

    @Bean
    public TopicExchange purchaseExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue ticketQueue() {
        return new Queue(TICKET_QUEUE, true);
    }

    @Bean
    public Queue merchQueue() {
        return new Queue(MERCH_QUEUE, true);
    }

    @Bean
    public Binding ticketBinding(Queue ticketQueue, TopicExchange purchaseExchange) {
        return BindingBuilder.bind(ticketQueue).to(purchaseExchange).with(ROUTING_KEY_TICKET);
    }

    @Bean
    public Binding merchBinding(Queue merchQueue, TopicExchange purchaseExchange) {
        return BindingBuilder.bind(merchQueue).to(purchaseExchange).with(ROUTING_KEY_MERCH);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setIgnoreDeclarationExceptions(true);
        return admin;
    }
}

