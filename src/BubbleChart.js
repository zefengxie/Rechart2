// BubbleChart.js
import React, { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { composedData } from "./data";

const COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
  "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#00bcd4", "#4caf50",
  "#f44336", "#ff9800", "#9c27b0", "#3f51b5", "#009688", "#795548",
  "#607d8b", "#cddc39", "#e91e63", "#2196f3", "#ff5722", "#3e2723"
];

const BubbleChart = ({ visibleDates, visibleMakes }) => {
  const groupedData = useMemo(() => {
    const grouped = {};

    composedData.forEach(d => {
      if (!visibleDates.has(d.date) || (d.make && !visibleMakes.has(d.make))) return;

      if (!grouped[d.make]) {
        grouped[d.make] = { make: d.make, impressions: 0, clicks: 0, valueSum: 0, count: 0 };
      }

      grouped[d.make].impressions += d.impressions;
      grouped[d.make].clicks += d.clicks;
      grouped[d.make].valueSum += d.value;
      grouped[d.make].count += 1;
    });

    return Object.values(grouped).map((d, i) => ({
      make: d.make,
      sumOverlap: Math.round(d.impressions / 1000), // scale down
      sumRelevance: Math.round(d.clicks),
      size: Math.round(d.valueSum / d.count),
      color: COLORS[i % COLORS.length],
    }));
  }, [visibleDates, visibleMakes]);

  return (
    <div className="chart-box">
      <h4>Competitor Make Overlap</h4>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey="sumOverlap" name="Sum Overlap" stroke="#ccc" />
          <YAxis dataKey="sumRelevance" name="Sum Relevance" stroke="#ccc" />
          <ZAxis dataKey="size" range={[100, 500]} name="Size" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "sumOverlap") return [`${value}k`, "Overlap"];
              if (name === "sumRelevance") return [value, "Relevance"];
              if (name === "size") return [value, "Avg Value"];
              return value;
            }}
          />
          <Scatter name="Makes" data={groupedData} fill="#8884d8">
            {groupedData.map((entry, index) => (
              <circle key={`dot-${index}`} r={entry.size} fill={entry.color} opacity={0.5} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BubbleChart;
