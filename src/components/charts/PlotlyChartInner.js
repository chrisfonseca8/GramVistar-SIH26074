"use client";

import Plotly from "plotly.js-cartesian-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

// Cartesian-only bundle (heatmap, contour, scatter, bar — no 3D/geo/mapbox)
// to avoid shipping the full ~4MB plotly.js for the handful of trace types
// this app actually uses.
const BasePlot = createPlotlyComponent(Plotly);

// Plotly's default layout is an opaque white paper with black text, which
// looks broken inside the app's dark theme. `currentColor`/
// `transparent` are valid SVG paint values that inherit from the
// surrounding page, so every chart automatically matches light/dark mode
// without each call site setting its own theme colors.
const THEME_LAYOUT_DEFAULTS = {
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "currentColor" },
};

export default function PlotlyChartInner({ layout, ...props }) {
  return (
    <BasePlot
      layout={{
        ...THEME_LAYOUT_DEFAULTS,
        ...layout,
        font: { ...THEME_LAYOUT_DEFAULTS.font, ...layout?.font },
      }}
      {...props}
    />
  );
}
