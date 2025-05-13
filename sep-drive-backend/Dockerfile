FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:21-slim
WORKDIR /app
COPY --from=build /app/target/sep-drive-backend-0.0.1-SNAPSHOT.jar .
CMD ["java", "-jar", "sep-drive-backend-0.0.1-SNAPSHOT.jar"]

