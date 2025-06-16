import React, { useMemo } from "react";
import { Treemap, Tooltip, ResponsiveContainer } from "recharts";

// 多彩配色数组
const COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b",
  "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#00bcd4", "#4caf50",
  "#f44336", "#ff9800", "#9c27b0", "#3f51b5", "#009688", "#795548",
  "#607d8b", "#cddc39", "#e91e63", "#2196f3", "#ff5722", "#3e2723"
];

// ✅ 自定义内容组件，让每块 Treemap 有不同颜色
const CustomizedContent = (props) => {
  const {
    x, y, width, height, index, name,
  } = props;

  const color = COLORS[index % COLORS.length];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: "#fff",
          strokeWidth: 2,
        }}
      />
      {width > 60 && height > 20 && (
        <text
          x={x + 6}
          y={y + 20}
          fill="#fff"
          fontSize={14}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
    </g>
  );
};

export default function TreemapChart({ rawData = [], visibleDates = new Set(), visibleMakes = new Set() }) {
  const filteredTreemapData = useMemo(() => {
    const grouped = {};
    rawData.forEach(d => {
      if (
        visibleDates.has(d.date) &&
        (!d.make || visibleMakes.has(d.make))
      ) {
        const key = `${d.make} `; // ✅ 显示品牌 + 车型
        if (!grouped[key]) grouped[key] = { size: 0, make: d.make, name: d.name };
        grouped[key].size += d.size || d.value || 0; // ✅ 使用 composedData.value 作为 Treemap 的 size
      }
    });
    return Object.entries(grouped).map(([label, obj]) => ({
      name: label,
      size: obj.size
    }));
  }, [rawData, visibleDates, visibleMakes]);

  return (
    <div className="chart-box">
      <h4>Competitor Segment Size and Coverage</h4>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={filteredTreemapData}
          dataKey="size"
          nameKey="name"
          content={<CustomizedContent />}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}