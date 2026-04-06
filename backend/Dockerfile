# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom first (layer-cache dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the fat JAR
COPY src ./src
RUN mvn package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy only the fat JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Render sets PORT env var; Spring Boot reads server.port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
