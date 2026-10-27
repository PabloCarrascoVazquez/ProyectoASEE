package com.subsonic.shipinventoryservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración RabbitMQ para ShipInventoryService.
 *
 * Este servicio actúa como CONSUMIDOR de la cola "merch_queue" definida en PurchaseService.
 * El exchange y la cola son durable y se reutilizan tal cual los define PurchaseService,
 * con idempotencia garantizada por "ignoreDeclarationExceptions=true".
 *
 * Flujo:
 *   PurchaseService → exchange(subsonic.purchases.exchange) → routing_key(order.merch) → merch_queue
 *   ShipInventoryService ← @RabbitListener(queues = "merch_queue") ← MerchOrderConsumer
 */
@Configuration
public class RabbitMQConfig {

    // Constantes compartidas con PurchaseService (mismo exchange y cola)
    public static final String EXCHANGE_NAME      = "subsonic.purchases.exchange";
    public static final String MERCH_QUEUE        = "merch_queue";
    public static final String ROUTING_KEY_MERCH  = "order.merch";

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

    /**
     * Declara el exchange de forma idempotente.
     * Si PurchaseService ya lo creó, RabbitMQ lo ignorará sin error.
     */
    @Bean
    public TopicExchange purchaseExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    /**
     * Declara la cola merch_queue de forma idempotente (durable=true).
     */
    @Bean
    public Queue merchQueue() {
        return new Queue(MERCH_QUEUE, true);
    }

    /**
     * Binding queue→exchange con routing key order.merch.
     */
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

    /**
     * RabbitAdmin: permite declarar exchanges/queues/bindings en arranque.
     * ignoreDeclarationExceptions=true → no falla si RabbitMQ no está disponible en dev.
     */
    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setIgnoreDeclarationExceptions(true);
        return admin;
    }

    /**
     * Container factory con convertidor JSON para los @RabbitListener.
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        factory.setPrefetchCount(10);
        return factory;
    }
}
