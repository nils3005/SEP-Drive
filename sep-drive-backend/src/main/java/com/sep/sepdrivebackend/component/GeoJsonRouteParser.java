package com.sep.sepdrivebackend.component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class GeoJsonRouteParser {

    public List<double[]> extractCoordinates(String route) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(route);
            JsonNode coords = root.at("/features/0/geometry/coordinates");
            List<double[]> list = new ArrayList<>();
            for (JsonNode coord : coords) {
                list.add(new double[]{coord.get(1).asDouble(), coord.get(0).asDouble()});
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException("GeoJSON parsing failed", e);
        }
    }

    public List<Double> percentageOfRoute(List<double[]> coordinates, double totalDistance) {
        List<Double> list = new ArrayList<>();
        for(int i = 0; i<coordinates.size()-1; i++) {
            double percent = distanceOfTwoCoords(coordinates.get(i), coordinates.get(i+1));
            list.add(percent);
        }
        return list;
    }

    public double distanceOfTwoCoords(double[] firstCoord, double[] secondCoord) {
        double x = (secondCoord[1] - firstCoord[1]) * 111.32 *Math.cos(Math.toRadians(firstCoord[0]+secondCoord[0]/2));
        double y = (firstCoord[0] - secondCoord[0]) * 110.574;
        return Math.sqrt(x * x + y * y);
    }


    /*public double[] getCoordAtProgress(String geoJson, double progress) {
        List<double[]> coords = extractCoordinates(geoJson);
        int index = Math.min((int)(progress / 100 * (coords.size() - 1)), coords.size() - 1);
        return coords.get(index);
    }*/
}

