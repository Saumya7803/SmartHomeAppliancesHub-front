import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const palette = ["#f97316", "#2563eb", "#0f172a", "#22c55e", "#eab308", "#ef4444"];

export function RevenueTrendChart({
  rows = [],
  title = "Revenue Trend",
  subtitle = "Last 7 days",
  lineColor = "#2563eb",
  fillColor = "rgba(37, 99, 235, 0.14)",
  yPrefix = "INR ",
}) {
  const labels = rows.map((row) => row.label || "-");
  const values = rows.map((row) => Number(row.revenue || 0));

  return (
    <article className="admin-chart-card">
      <div className="admin-chart-card-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="admin-chart-canvas-wrap">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Revenue",
                data: values,
                borderColor: lineColor,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.35,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                ticks: {
                  callback: (value) => (yPrefix ? `${yPrefix}${value}` : value),
                },
              },
            },
          }}
        />
      </div>
    </article>
  );
}

export function DistributionChart({
  rows = [],
  labelKey = "status",
  valueKey = "total",
  title = "Distribution",
  subtitle = "Breakdown",
}) {
  const labels = rows.map((row) => row[labelKey] || "-");
  const values = rows.map((row) => Number(row[valueKey] || 0));

  return (
    <article className="admin-chart-card">
      <div className="admin-chart-card-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="admin-chart-canvas-wrap">
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: palette.slice(0, Math.max(values.length, 1)),
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </article>
  );
}
