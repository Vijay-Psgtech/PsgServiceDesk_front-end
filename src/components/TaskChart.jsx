"use client";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_COLORS = ["#6366F1", "#EC4899", "#F97316", "#22C55E", "#EAB308"];

export default function TaskChart({
  data = [],
  colorScheme = DEFAULT_COLORS,
  showPercent = true,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () =>
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);

    checkDark();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", checkDark);

    const handleResize = () => setShowLabels(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      mq.removeEventListener("change", checkDark);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!data.length)
    return (
      <div className="text-center text-sm text-gray-400 dark:text-gray-500 italic mt-8">
        No task data available
      </div>
    );

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="w-full h-72 md:h-96 transition-colors duration-300"
      role="img"
      aria-label="Task distribution pie chart"
    >
      <ResponsiveContainer>
        <PieChart>
          {/* Gradient fills */}
          <defs>
            {data.map((_, index) => (
              <linearGradient
                key={index}
                id={`color${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={colorScheme[index % colorScheme.length]}
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor={colorScheme[index % colorScheme.length]}
                  stopOpacity={0.5}
                />
              </linearGradient>
            ))}
          </defs>

          {/* Pie chart */}
          <Pie
            dataKey="value"
            data={data}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            animationBegin={200}
            animationDuration={1000}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            label={
              showLabels
                ? ({ name, value }) => {
                    const percentage = ((value / total) * 100).toFixed(0);
                    return showPercent
                      ? `${name}: ${value} (${percentage}%)`
                      : `${name}: ${value}`;
                  }
                : false
            }
            labelLine={showLabels ? { stroke: "#ccc", strokeWidth: 1 } : false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#color${index})`}
                stroke={isDarkMode ? "#1F2937" : "#ffffff"}
                strokeWidth={activeIndex === index ? 3 : 1}
                style={{
                  cursor: "pointer",
                  filter:
                    activeIndex === index
                      ? "drop-shadow(0 0 8px rgba(0,0,0,0.3))"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </Pie>

          {/* Tooltip */}
          <Tooltip
            formatter={(value, name) => [`${value} Tasks`, name]}
            contentStyle={{
              backgroundColor: isDarkMode ? "#1F2937" : "#ffffff",
              color: isDarkMode ? "#F3F4F6" : "#374151",
              border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: isDarkMode
                ? "0 4px 10px rgba(0,0,0,0.4)"
                : "0 4px 8px rgba(0,0,0,0.1)",
              fontSize: "0.875rem",
            }}
            itemStyle={{
              color: isDarkMode ? "#E5E7EB" : "#374151",
            }}
          />

          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              fontSize: "0.875rem",
              color: isDarkMode ? "#D1D5DB" : "#374151",
              marginTop: "10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

