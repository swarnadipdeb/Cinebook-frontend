# BookingService — Microservice Specification

## Overview

**Service Name**: booking-service
**Language/Framework**: Java 21 + Spring Boot 3.x
**Database**: MySQL 8.0
**Cache**: Redis (Spring Data Redis)
**Message Broker**: RabbitMQ (Spring AMQP)
**Port**: 8081
**Build Tool**: Maven

---

## 1. Functionality

### 1.1 Core Features

| Feature | Description |
|---------|-------------|
| **Create Booking** | Reserve seats for a showtime, process payment, generate ticket |
| **Cancel Booking** | Full/partial refund, release seats back to inventory |
| **Get Booking** | Retrieve booking details by ID |
| **Get User Bookings** | List all bookings for a user with pagination |
| **Seat Hold** | Temporarily lock seats during checkout (5-minute TTL) |
| **Confirm Booking** | Convert seat hold to confirmed booking |

### 1.2 Booking Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Seat Hold   │───▶│ Payment     │───▶│ Confirmed   │
│ (5 min TTL) │    │ Processing  │    │ Booking     │
└─────────────┘    └─────────────┘    └─────────────┘
      │                   │                  │
      ▼                   ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Hold Expires│    │ Payment     │    │ Ticket      │
│ → Release   │    │ Failed      │    │ Generated   │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 2. API Endpoints

### 2.1 Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/bookings` | Create new booking |
| `GET` | `/api/v1/bookings/{id}` | Get booking by ID |
| `GET` | `/api/v1/bookings` | List bookings (with filters) |
| `PUT` | `/api/v1/bookings/{id}/cancel` | Cancel a booking |
| `GET` | `/api/v1/bookings/{id}/ticket` | Get ticket details |

### 2.2 Seat Hold Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/seat-holds` | Create seat hold |
| `POST` | `/api/v1/seat-holds/{id}/confirm` | Confirm hold → booking |
| `DELETE` | `/api/v1/seat-holds/{id}` | Release hold manually |

### 2.3 Request/Response Schemas

#### Create Booking

```json
// POST /api/v1/bookings
// Request
{
  "showtimeId": "uuid-string",
  "seats": [
    { "row": "A", "number": 5 },
    { "row": "A", "number": 6 }
  ],
  "paymentMethod": "CARD",
  "paymentToken": "tok_xxx"
}

// Response (201)
{
  "success": true,
  "data": {
    "bookingId": "uuid-string",
    "ticketId": "TKT-2026-XXXXX",
    "status": "CONFIRMED",
    "totalAmount": 450.00,
    "currency": "INR",
    "seats": [...],
    "showtime": {...},
    "movie": {...},
    "qrCode": "base64-encoded-qr"
  }
}
```

#### Get Booking

```json
// GET /api/v1/bookings/{id}
// Response (200)
{
  "success": true,
  "data": {
    "bookingId": "uuid-string",
    "ticketId": "TKT-2026-XXXXX",
    "status": "CONFIRMED",
    "userId": "uuid-string",
    "showtime": {
      "id": "uuid-string",
      "date": "2026-04-05",
      "time": "14:30",
      "screen": "Screen 2",
      "theater": { "name": "PVR Nexus", "location": "Bengaluru" }
    },
    "movie": {
      "id": "uuid-string",
      "title": "Avatar 3",
      "posterUrl": "https://...",
      "duration": 162
    },
    "seats": [
      { "row": "A", "number": 5, "type": "PREMIUM", "price": 250.00 }
    ],
    "totalAmount": 450.00,
    "currency": "INR",
    "payment": {
      "method": "CARD",
      "last4": "4242",
      "transactionId": "txn_xxx"
    },
    "createdAt": "2026-04-05T10:30:00Z",
    "cancelledAt": null
  }
}
```

---

## 3. Database Schema

### 3.1 Tables

```sql
-- bookings table
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    showtime_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(20) NOT NULL,
    payment_transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_showtime_id (showtime_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- booking_seats table (many-to-many)
CREATE TABLE booking_seats (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    row_name VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    seat_type VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_booking (booking_id, row_name, seat_number)
);

-- seat_holds table (temporary reservations)
CREATE TABLE seat_holds (
    id VARCHAR(36) PRIMARY KEY,
    showtime_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    seats JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_showtime_expires (showtime_id, expires_at),
    INDEX idx_user_id (user_id)
);
```

### 3.2 Redis Keys

```
# Seat availability (real-time)
seats:showtime:{showtimeId} → SET of "row:number"

# Seat hold lock
hold:seat:{showtimeId}:{row}:{number} → {holdId}
TTL: 300 seconds (5 minutes)

# Booking cache
booking:{bookingId} → JSON
TTL: 3600 seconds
```

---

## 4. Business Rules

### 4.1 Seat Hold Rules

| Rule | Value |
|------|-------|
| Hold TTL | 5 minutes |
| Max seats per hold | 10 |
| Auto-release on expiry | Yes (Redis key expiration + scheduled task) |
| Hold confirmation timeout | 60 seconds for payment |

### 4.2 Booking Rules

| Rule | Value |
|------|-------|
| Max seats per booking | 10 |
| Minimum booking amount | ₹50 |
| Cancellation window | Within 30 minutes of showtime |
| Refund processing time | 5-7 business days |
| Ticket generation | Immediate on confirmation |

### 4.3 Pricing Rules

```java
public enum SeatType {
    STANDARD(150.00),
    PREMIUM(250.00),
    VIP(350.00),
    RECLINER(500.00);

    private final BigDecimal basePrice;

    // getters, constructor
}
```

### 4.4 Concurrency Handling

```java
@Service
public class SeatReservationService {

    public boolean reserveSeat(String showtimeId, String row, int number, String holdId) {
        String lockKey = String.format("hold:seat:%s:%s:%d", showtimeId, row, number);

        // SET NX with TTL using RedisTemplate
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, holdId, Duration.ofSeconds(300));

        return Boolean.TRUE.equals(result);
    }
}
```

---

## 5. Event Definitions

### 5.1 Events Published to RabbitMQ

```java
// Event classes
public record BookingCreatedEvent(
    String bookingId,
    String userId,
    String showtimeId,
    BigDecimal totalAmount,
    Instant timestamp
) {}

public record BookingConfirmedEvent(
    String bookingId,
    String ticketId,
    String userId,
    List<SeatDto> seats,
    Instant timestamp
) {}

public record BookingCancelledEvent(
    String bookingId,
    String userId,
    BigDecimal refundAmount,
    String reason,
    Instant timestamp
) {}

public record SeatHoldCreatedEvent(
    String holdId,
    String showtimeId,
    List<SeatDto> seats,
    Instant expiresAt
) {}

public record SeatHoldExpiredEvent(
    String holdId,
    String showtimeId,
    List<SeatDto> seats
) {}
```

### 5.2 RabbitMQ Configuration

```yaml
# Exchange: booking.events (topic)
# Queues:
#   - booking.notification.queue (binding: booking.#)
#   - booking.analytics.queue (binding: booking.#)
```

---

## 6. Error Handling

### 6.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SEAT_NOT_AVAILABLE` | 409 | Seat already booked or held |
| `HOLD_EXPIRED` | 410 | Seat hold has expired |
| `INVALID_SHOWTIME` | 400 | Showtime doesn't exist or past |
| `BOOKING_NOT_FOUND` | 404 | Booking ID doesn't exist |
| `CANCEL_WINDOW_EXPIRED` | 400 | Past cancellation window |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `MAX_SEATS_EXCEEDED` | 400 | Too many seats requested |

### 6.2 Error Response Format

```java
// GlobalExceptionHandler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SeatNotAvailableException.class)
    public ApiResponse<Void> handleSeatNotAvailable(SeatNotAvailableException ex) {
        return ApiResponse.error("SEAT_NOT_AVAILABLE", ex.getMessage());
    }
}

// Standard error response
{
  "success": false,
  "error": {
    "code": "SEAT_NOT_AVAILABLE",
    "message": "One or more selected seats are no longer available",
    "details": {
      "unavailableSeats": [
        { "row": "A", "number": 5 }
      ]
    }
  }
}
```

---

## 7. Service Dependencies

```
booking-service
    ├── MySQL (Spring Data JPA)
    ├── Redis (Spring Data Redis)
    ├── RabbitMQ (Spring AMQP)
    ├── auth-service (REST client)
    ├── payment-service (REST client)
    └── showtime-service (REST client)
```

### 7.1 REST Client Interfaces

```java
@FeignClient(name = "auth-service", url = "${services.auth-service.url}")
public interface AuthServiceClient {
    @GetMapping("/api/v1/users/{id}")
    UserDto validateTokenAndGetUser(@RequestHeader("Authorization") String token);
}

@FeignClient(name = "payment-service", url = "${services.payment-service.url}")
public interface PaymentServiceClient {
    @PostMapping("/api/v1/payments/charge")
    PaymentResult charge(@RequestBody PaymentRequest request);

    @PostMapping("/api/v1/payments/refund")
    RefundResult refund(@RequestBody RefundRequest request);
}

@FeignClient(name = "showtime-service", url = "${services.showtime-service.url}")
public interface ShowtimeServiceClient {
    @GetMapping("/api/v1/showtimes/{id}")
    ShowtimeDto getShowtime(@PathVariable String id);

    @GetMapping("/api/v1/showtimes/{id}/pricing")
    PricingDto getPricing(@PathVariable String id, @RequestBody List<SeatDto> seats);
}
```

---

## 8. Configuration

### 8.1 application.yml

```yaml
server:
  port: 8081

spring:
  application:
    name: booking-service

  datasource:
    url: jdbc:mysql://localhost:3306/booking_db?useSSL=false&serverTimezone=UTC
    username: booking_service
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      idle-timeout: 300000
      max-lifetime: 1200000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true

  data:
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD}
      timeout: 2000ms

  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: ${RABBITMQ_PASSWORD}
    virtual-host: /booking

  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

booking:
  hold-ttl-seconds: 300
  max-seats-per-booking: 10
  cancellation-window-minutes: 30

services:
  auth-service-url: http://localhost:8082
  payment-service-url: http://localhost:8083
  showtime-service-url: http://localhost:8084

logging:
  level:
    com.booking: DEBUG
    org.springframework.amqp: INFO
```

---

## 9. Acceptance Criteria

### 9.1 Functional

- [ ] User can hold up to 10 seats for 5 minutes
- [ ] Held seats are not available for other users
- [ ] Expired holds automatically release seats
- [ ] Booking creates ticket with unique TKT-YYYY-XXXXX ID
- [ ] Cancellation within window triggers full refund
- [ ] All booking state changes publish events to RabbitMQ

### 9.2 Non-Functional

- [ ] Seat hold creation: < 50ms p99
- [ ] Booking creation: < 500ms p99
- [ ] Concurrent seat reservations handled without race conditions
- [ ] Redis connection failure gracefully degrades to DB-only mode

### 9.3 Testing Criteria

- [ ] Unit tests: 80%+ coverage on service layer
- [ ] Integration tests: All API endpoints with @SpringBootTest
- [ ] Concurrency tests: 100 concurrent seat holds on same showtime

---

## 10. Project Structure

```
booking-service/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/moviebooking/booking/
│   │   │   ├── BookingServiceApplication.java
│   │   │   ├── config/
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── RabbitMQConfig.java
│   │   │   │   ├── FeignClientConfig.java
│   │   │   │   └── BookingProperties.java
│   │   │   ├── controller/
│   │   │   │   ├── BookingController.java
│   │   │   │   └── SeatHoldController.java
│   │   │   ├── service/
│   │   │   │   ├── BookingService.java
│   │   │   │   ├── BookingServiceImpl.java
│   │   │   │   ├── SeatHoldService.java
│   │   │   │   ├── SeatHoldServiceImpl.java
│   │   │   │   └── PricingService.java
│   │   │   ├── repository/
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── BookingSeatRepository.java
│   │   │   │   └── SeatHoldRepository.java
│   │   │   ├── entity/
│   │   │   │   ├── Booking.java
│   │   │   │   ├── BookingSeat.java
│   │   │   │   └── SeatHold.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── CreateBookingRequest.java
│   │   │   │   │   ├── CreateSeatHoldRequest.java
│   │   │   │   │   └── SeatDto.java
│   │   │   │   └── response/
│   │   │   │       ├── BookingResponse.java
│   │   │   │       ├── ApiResponse.java
│   │   │   │       └── ErrorResponse.java
│   │   │   ├── event/
│   │   │   │   ├── BookingEventPublisher.java
│   │   │   │   └── events/
│   │   │   │       ├── BookingCreatedEvent.java
│   │   │   │       ├── BookingConfirmedEvent.java
│   │   │   │       └── BookingCancelledEvent.java
│   │   │   ├── client/
│   │   │   │   ├── AuthServiceClient.java
│   │   │   │   ├── PaymentServiceClient.java
│   │   │   │   └── ShowtimeServiceClient.java
│   │   │   ├── exception/
│   │   │   │   ├── SeatNotAvailableException.java
│   │   │   │   ├── HoldExpiredException.java
│   │   │   │   ├── BookingNotFoundException.java
│   │   │   │   ├── PaymentFailedException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── mapper/
│   │   │       └── BookingMapper.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       └── java/com/moviebooking/booking/
│           ├── service/
│           │   ├── BookingServiceTest.java
│           │   └── SeatHoldServiceTest.java
│           └── controller/
│               └── BookingControllerTest.java
└── docker-compose.yml
```

---

## 11. Key Spring Boot Dependencies

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Feign Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>

    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 12. Scheduled Tasks

### 12.1 Seat Hold Expiry Cleanup

```java
@Component
@RequiredArgsConstructor
public class SeatHoldCleanupScheduler {

    private final SeatHoldRepository seatHoldRepository;
    private final SeatHoldService seatHoldService;

    @Scheduled(fixedRate = 60000) // Every minute
    public void cleanupExpiredHolds() {
        List<SeatHold> expiredHolds = seatHoldRepository
            .findByStatusAndExpiresAtBefore(SeatHoldStatus.ACTIVE, Instant.now());

        for (SeatHold hold : expiredHolds) {
            seatHoldService.releaseExpiredHold(hold);
        }
    }
}
```
