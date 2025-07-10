# Build Stage
FROM maven:3.8.3-openjdk-17 AS build

# 1. Copy only the pom.xml first to define the project dependencies
COPY pom.xml /home/app/pom.xml

# 2. Run a Maven goal that only downloads dependencies. This layer will be cached.
RUN mvn -f /home/app/pom.xml dependency:go-offline

# 3. Copy the rest of your source code. Changes here won't affect the layer above.
COPY src /home/app/src

# 4. Run the package command. This now uses the cached dependencies and is much faster.
RUN mvn -f /home/app/pom.xml clean package

# Package stage
#
FROM openjdk:17-jdk-slim
# Use a wildcard (*) to copy the generated .jar file, whatever its name is.
COPY --from=build /home/app/target/*.jar /usr/local/lib/demo.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/usr/local/lib/demo.jar"]