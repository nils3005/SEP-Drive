package com.sep.sepdrivebackend.component;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sep.sepdrivebackend.entities.Location;
import com.sep.sepdrivebackend.exception.GeoJsonParsingException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class GeoJsonRouteParser {

    public List<double[]> extractCoordinates(String route) {
        try {
            List<double[]> coordinates = new ArrayList<>();
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(route);
            JsonNode coords = root.at("/features/0/geometry/coordinates");
            for (JsonNode coord : coords) {
                coordinates.add(new double[]{coord.get(1).asDouble(), coord.get(0).asDouble()});
            }
            return coordinates;
        } catch (Exception e) {
            throw new GeoJsonParsingException("GeoJson parsing failed");
        }
    }

    public List<Double> percentageOfRoute(List<double[]> coordinates, double totalDistance) {
        List<Double> percentages = new ArrayList<>();
        for(int i = 0; i<coordinates.size()-1; i++) {
            double percent = distanceOfTwoCoords(coordinates.get(i), coordinates.get(i+1))/totalDistance;
            percentages.add(percent);
        }
        return percentages;
    }

    //Haversine-Formula
    //Author: Harpal Singh
    //Website: https://www.baeldung.com/java-find-distance-between-points
    public double distanceOfTwoCoords(double[] firstCoord, double[] secondCoord) {
        final int R = 6371;

        double lat1 = firstCoord[0];
        double lon1 = firstCoord[1];
        double lat2 = secondCoord[0];
        double lon2 = secondCoord[1];

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 1000 * R * c;
    }

    public String generateGeoJson(Location start, List<Location> waypoints, Location destination) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();

            List<double[]> coordsList = new ArrayList<>();
            coordsList.add(new double[]{Double.parseDouble(start.getLongitude()), Double.parseDouble(start.getLatitude())});
            if (waypoints != null) {
                for (Location wp : waypoints) {
                    coordsList.add(new double[]{
                            Double.parseDouble(wp.getLongitude()),
                            Double.parseDouble(wp.getLatitude())
                    });
                }
            }
            coordsList.add(new double[]{Double.parseDouble(destination.getLongitude()), Double.parseDouble(destination.getLatitude())});

            ObjectNode geometry = objectMapper.createObjectNode();
            geometry.put("type", "LineString");
            ArrayNode coordinates = objectMapper.createArrayNode();
            for (double[] coord : coordsList) {
                ArrayNode point = objectMapper.createArrayNode();
                point.add(coord[0]);
                point.add(coord[1]);
                coordinates.add(point);
            }
            geometry.set("coordinates", coordinates);

            ObjectNode feature = objectMapper.createObjectNode();
            feature.put("type", "Feature");
            feature.set("geometry", geometry);

            ArrayNode features = objectMapper.createArrayNode();
            features.add(feature);

            ObjectNode geoJson = objectMapper.createObjectNode();
            geoJson.put("type", "FeatureCollection");
            geoJson.set("features", features);

            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(geoJson);
        } catch (Exception e) {
            throw new GeoJsonParsingException("Failed to generate GeoJSON.");
        }
    }

}


