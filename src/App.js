// ✅ Final version with Date + Make filter as functional, others as static (no dropdown content)
import React, { useState, useMemo } from "react";
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Treemap, Legend, Line, ScatterChart, Scatter, ZAxis
} from "recharts";
import {
  composedData,
  pieDataRaw,
  barData,
} from "./data";
import "./App.css";
import TreemapChart from "./TreemapChart";
import BubbleChart from "./BubbleChart";

const COLORS = ["#26c6da", "#66bb6a"];

export default function DashboardLayout() {
  const filters = ["Date", "Make", "Model", "Bodystyle", "Badge", "Vehicle Condition"];

  const allDates = useMemo(() => composedData.map(d => d.date), []);
  const [visibleDates, setVisibleDates] = useState(new Set(allDates));
  const toggleDate = (date) => {
    setVisibleDates(prev => {
      const updated = new Set(prev);
      updated.has(date) ? updated.delete(date) : updated.add(date);
      return updated;
    });
  };

  const allMakes = useMemo(() => Array.from(new Set(composedData.map(d => d.make).filter(Boolean))), []);
  const [visibleMakes, setVisibleMakes] = useState(new Set(allMakes));
  const toggleMake = (make) => {
    setVisibleMakes(prev => {
      const updated = new Set(prev);
      updated.has(make) ? updated.delete(make) : updated.add(make);
      return updated;
    });
  };

  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const toggleFilter = (filter) => {
    setSelectedFilters(prev => {
      const updated = new Set(prev);
      updated.has(filter) ? updated.delete(filter) : updated.add(filter);
      return updated;
    });
  };

  const filtered = (data) =>
    data.filter(d => visibleDates.has(d.date) && (!d.make || visibleMakes.has(d.make)));

  const pieData = useMemo(() => {
    const filteredData = filtered(pieDataRaw);
    const result = { New: 0, Used: 0 };
    filteredData.forEach(d => {
      if (d.name === "New") result.New += d.value;
      else result.Used += d.value;
    });
    return [
      { name: "New", value: result.New },
      { name: "Used", value: result.Used }
    ];
  }, [visibleDates, visibleMakes]);

  const barStageData = useMemo(() => {
    const filteredData = filtered(barData);
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.stage]) {
        grouped[d.stage] = { stage: d.stage, groupA: 0, groupB: 0 };
      }
      grouped[d.stage].groupA += d.groupA;
      grouped[d.stage].groupB += d.groupB;
    });
    return Object.values(grouped);
  }, [visibleDates, visibleMakes]);

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <h2>Audience Insights</h2>
        <div className="dashboard-menu">☰</div>
      </div>

      <div className="filter-bar">
        {filters.map(f => (
          <div key={f} className="filter-wrapper">
            <button
              onClick={() => toggleFilter(f)}
              className={selectedFilters.has(f) ? "filter-button active" : "filter-button"}
            >
              {f} <span className="arrow-down">▾</span>
            </button>

            {f === "Date" && selectedFilters.has("Date") && (
              <div className="checkbox-dropdown">
                <div className="dropdown-header">Date In List</div>
                <div className="dropdown-items">
                  {allDates.map(date => (
                    <label key={date}>
                      <input
                        type="checkbox"
                        checked={visibleDates.has(date)}
                        onChange={() => toggleDate(date)}
                      /> {date}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {f === "Make" && selectedFilters.has("Make") && (
              <div className="checkbox-dropdown">
                <div className="dropdown-header">Make In List</div>
                <div className="dropdown-items">
                  {allMakes.map(make => (
                    <label key={make}>
                      <input
                        type="checkbox"
                        checked={visibleMakes.has(make)}
                        onChange={() => toggleMake(make)}
                      /> {make}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!(f === "Date" || f === "Make") && selectedFilters.has(f) && (
              <div className="checkbox-dropdown">
                <div className="dropdown-header">No Options</div>
                <div className="dropdown-items" style={{ color: '#aaa', padding: '6px 12px' }}>Coming Soon...</div>
              </div>
            )}

          </div>
        ))}
      </div>

      <div className="summary-cards">
        {[{ label: 'Number of shared segments', value: '1,263' }, { label: 'Number of Make segments', value: '10' }, { label: 'Number of Model segments', value: '84' }].map(({ label, value }) => (
          <div key={label} className="summary-card">
            <div className="summary-label">{label}</div>
            <div className="summary-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="top-section" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
        <div className="chart-box" style={{ flex: '1 1 600px', minWidth: 300 }}>
          <h4>Impressions and Clicks</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={filtered(composedData)}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} stroke="#ccc" />
              <YAxis yAxisId="left" stroke="#ccc" tickFormatter={(v) => `${Math.round(v / 1000)}k`} label={{ value: "Impressions", angle: -90, position: "insideLeft", offset: 5 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#ccc" label={{ value: "Clicks", angle: 90, position: "insideRight", offset: 5 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", color: "#fff" }}
                formatter={(value, name) => {
                  if (name === "impressions") return [`${Math.round(value / 1000)}k`, "Impressions"];
                  if (name === "clicks") return [value, "Clicks"];
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="impressions" fill="#cfd8dc" barSize={18} name="Impressions" />
              <Line yAxisId="right" dataKey="clicks" stroke="#26a69a" strokeWidth={2.5} dot={{ r: 3 }} name="Clicks" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="feed-box">
          <h3 className="feed-title">Data Storytelling Feed</h3>
          <ul className="feed-list">
            <li><strong>Toyota Yaris Persona – Eco-Explorer</strong><div className="feed-date">02-06-2025 – Rhys Joachim</div></li>
            <li><strong>Toyota Hilux Persona – The Practical Performer</strong><div className="feed-date">02-06-2025 – Rhys Joachim</div></li>
            <li><strong>Toyota Key Audience Personas</strong><div className="feed-date">19-03-2025 – Mansi Shukla</div></li>
          </ul>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-box">
          <h4>Audience Buyer Journey Stages</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={barStageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#ccc" />
              <YAxis type="category" dataKey="stage" stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="groupA" fill="#26c6da" barSize={10} />
              <Bar dataKey="groupB" fill="#66bb6a" barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <TreemapChart rawData={composedData} visibleDates={visibleDates} visibleMakes={visibleMakes} />
        <BubbleChart visibleDates={visibleDates} visibleMakes={visibleMakes} />

        <div className="chart-box">
          <h4>New vs Used Audiences</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}