"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
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
 * Generic panchayat-choropleth map — the 5 panchayat boundaries colored
 * and tooltipped however the caller decides, click a panchayat to select
 * it globally. Extracted from the Block Overview map's original
 * (vulnerability-specific) implementation so the Government
 * Risk Maps page (which needs the exact same
 * boundaries-colored-by-a-value-with-hover-and-click behavior for 9
 * different value domains) can reuse it instead of writing this Leaflet
 * boilerplate a second time; `BlockOverviewMapInner` now calls this too.
 *
 * @param {{
 * borders: GeoJSON.FeatureCollection,
 * selectedPanchayat: string|null,
 * onSelectPanchayat: (name: string) => void,
 * getFillColor: (panchayatName: string) => string,
 * getTooltip: (panchayatName: string) => string,
 * }} props
 */
export default function RiskLayerMapInner({
  borders,
  selectedPanchayat,
  onSelectPanchayat,
  getFillColor,
  getTooltip,
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
        key={selectedPanchayat ?? "none"}
        data={borders}
        style={(feature) => {
          const name = feature.properties?.panchayat_name;
          const isSelected = name === selectedPanchayat;
          return {
            color: isSelected ? "#0f172a" : "#1e293b",
            weight: isSelected ? 3 : 1,
            fillColor: name ? getFillColor(name) : "#cccccc",
            fillOpacity: 0.6,
          };
        }}
        onEachFeature={(feature, layer) => {
          const name = feature.properties?.panchayat_name;
          if (!name) return;
          layer.bindTooltip(getTooltip(name), { sticky: true });
          layer.on("click", () => onSelectPanchayat(name));
        }}
      />
    </MapContainer>
  );
}
