"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { valueToColor } from "@/lib/colorScale";
import { EmptyState } from "@/components/ui/EmptyState";

function computeGeoJsonBounds(featureCollection) {
  let lonMin = Infinity;
  let lonMax = -Infinity;
  let latMin = Infinity;
  let latMax = -Infinity;

  for (const feature of featureCollection.features) {
    const geometry = feature.geometry;
    const rings =
      geometry.type === "Polygon"
        ? geometry.coordinates
        : geometry.coordinates.flat();
    for (const ring of rings) {
      for (const [lon, lat] of ring) {
        lonMin = Math.min(lonMin, lon);
        lonMax = Math.max(lonMax, lon);
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
      }
    }
  }

  return [
    [latMin, lonMin],
    [latMax, lonMax],
  ];
}

/**
 * Time-driven choropleth map: panchayat boundaries colored
 * by whatever `valuesByPanchayat` the current animation frame holds,
 * against a **fixed** `range` (the min/max across all frames, not just
 * this one) so the color scale stays stable as frames advance — a panel
 * that recolors its own legend every frame would be misleading.
 */
export default function AnimatedChoroplethMapInner({
  borders,
  valuesByPanchayat,
  range,
  unit,
  frameKey,
}) {
  if (!borders || borders.features.length === 0) {
    return <EmptyState title="No boundary data available" />;
  }

  return (
    <MapContainer
      bounds={computeGeoJsonBounds(borders)}
      className="h-80 w-full rounded-lg"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={frameKey}
        data={borders}
        style={(feature) => {
          const name = feature.properties?.panchayat_name;
          const value = valuesByPanchayat[name];
          return {
            color: "#1e293b",
            weight: 1,
            fillColor:
              range && value != null ? valueToColor(value, range) : "#cccccc",
            fillOpacity: 0.75,
          };
        }}
        onEachFeature={(feature, layer) => {
          const name = feature.properties?.panchayat_name;
          if (!name) return;
          const value = valuesByPanchayat[name];
          layer.bindTooltip(
            `${name}: ${value != null ? `${value.toFixed(2)} ${unit}` : "no data"}`,
            { sticky: true },
          );
        }}
      />
    </MapContainer>
  );
}
