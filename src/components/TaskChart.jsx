import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_COLORS = ["#6366F1", "#EC4899", "#F97316", "#22C55E", "#EAB308"];

export default function TaskChart({ data = [], colorSchema = DEFAULT_COLORS }) {
  if (!data.length)
    return (
      <div className="text-center text-gray-400 text-sm italic mt-8">
        No task data available
      </div>
    );
  // Calculate total for Percentage labels
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-72 md:h-96">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            animationBegin={100}
            animationDuration={1000}
            label={({ name, value }) => {
              const percentage = ((value / total) * 100).toFixed(0);
              return `${name}: ${value} (${percentage}%)`;
            }}
            labelLine={{ stroke: "#ccc", strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorScheme[index % colorScheme.length]}
                stroke="#ffffff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} Tasks`, name]}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              fontSize: "0.875rem",
            }}
            itemStyle={{ color: "#374151" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: "0.875rem", color: "#374151" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
