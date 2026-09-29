"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Rectangle,
  Tooltip,
  GeoJSON,
} from "react-leaflet";
import { binPointsToGrid, computeGridRange } from "@/lib/spatial/grid";
import { valueToColor } from "@/lib/colorScale";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Elevation & Topography plot. Bins the 56,430-point
 * elevation grid down to a renderable raster of colored rectangles
 * (rendering all 56k points individually as Leaflet layers would be far
 * too slow), overlaid with the panchayat border outlines.
 */
export default function ElevationMapInner({
  elevationPoints,
  borders,
  gridSize = 25,
}) {
  const { lonCenters, latCenters, grid, cellWidthLon, cellHeightLat, bounds } =
    binPointsToGrid(elevationPoints, {
      gridSize,
      valueField: "elevationM",
    });

  if (!bounds) {
    return <EmptyState title="No elevation data available" />;
  }

  const range = computeGridRange(grid);
  const leafletBounds = [
    [bounds.latMin, bounds.lonMin],
    [bounds.latMax, bounds.lonMax],
  ];

  return (
    <MapContainer
      bounds={leafletBounds}
      className="h-96 w-full rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {grid.map((row, j) =>
        row.map((value, i) => {
          if (value === null) return null;
          const cellBounds = [
            [
              latCenters[j] - cellHeightLat / 2,
              lonCenters[i] - cellWidthLon / 2,
            ],
            [
              latCenters[j] + cellHeightLat / 2,
              lonCenters[i] + cellWidthLon / 2,
            ],
          ];
          return (
            <Rectangle
              key={`${i}-${j}`}
              bounds={cellBounds}
              pathOptions={{
                color: "transparent",
                fillColor: valueToColor(value, range ?? { min: 0, max: 1 }),
                fillOpacity: 0.75,
              }}
            >
              <Tooltip sticky>
                Elevation: {value.toFixed(0)} m
                <br />({latCenters[j].toFixed(4)}, {lonCenters[i].toFixed(4)})
              </Tooltip>
            </Rectangle>
          );
        }),
      )}
      {borders ? (
        <GeoJSON
          data={borders}
          style={{ color: "#1e293b", weight: 2, fillOpacity: 0 }}
          onEachFeature={(feature, layer) => {
            if (feature.properties?.panchayat_name) {
              layer.bindTooltip(feature.properties.panchayat_name, {
                sticky: true,
              });
            }
          }}
        />
      ) : null}
    </MapContainer>
  );
}
