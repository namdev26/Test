package com.notification.consumer;

import com.notification.dto.NotificationEvent;
import com.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "#{rabbitMQConfig.NOTIFICATION_QUEUE}")
    public void onNotificationEvent(NotificationEvent event) {
        log.info("[CONSUMER] Received event: type={}, bookingId={}, customer={}",
                event.getType(), event.getBookingId(), event.getCustomerEmail());
        notificationService.processEvent(event);
    }
}
