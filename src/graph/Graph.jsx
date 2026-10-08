// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// // Now takes real data as a prop instead of hardcoded fake numbers.
// // Expects: [{ date: "Jan 1", newUsers: 3, newSubscribers: 1 }, ...]
// export const LineGraph = ({ data = [] }) => {
//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" },
//       title: { display: true, text: "Activity (Last 7 Days)" },
//     },
//     scales: {
//       y: { beginAtZero: true },
//     },
//   };

//   const chartData = {
//     labels: data.map((d) => d.date),
//     datasets: [
//       {
//         label: "New Subscribers",
//         data: data.map((d) => d.newSubscribers),
//         borderColor: "rgb(59, 130, 246)",
//         backgroundColor: "rgba(59, 130, 246, 0.1)",
//         tension: 0.4,
//         fill: true,
//         pointRadius: 4,
//         pointHoverRadius: 6,
//       },
//       {
//         label: "New Users",
//         data: data.map((d) => d.newUsers),
//         borderColor: "rgb(239, 68, 68)",
//         backgroundColor: "rgba(239, 68, 68, 0.1)",
//         tension: 0.4,
//         fill: true,
//         pointRadius: 4,
//         pointHoverRadius: 6,
//       },
//       {
//         label: "New Downloads",
//         data: data.map((d) => d.newDownloads ?? 0),
//         borderColor: "rgb(16, 185, 129)",
//         backgroundColor: "rgba(16, 185, 129, 0.1)",
//         tension: 0.4,
//         fill: true,
//         pointRadius: 4,
//         pointHoverRadius: 6,
//       },
//     ],
//   };

//   return (
//     <div className="bg-white p-3 sm:p-4 rounded shadow border border-gray-200 h-[300px] sm:h-[360px] md:h-[420px]">
//       {data.length === 0 ? (
//         <p className="text-gray-400 text-center py-8">Loading graph...</p>
//       ) : (
//         <Line data={chartData} options={{ ...options, maintainAspectRatio: false }} />
//       )}
//     </div>
//   );
// };

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Filler is required whenever any dataset sets `fill: true` (all three
// below do, for the area-under-the-line effect). Without registering it,
// Chart.js silently skips the fill and logs a console warning instead of
// throwing, which is why the chart still rendered but with that warning.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Now takes real data as a prop instead of hardcoded fake numbers.
// Expects: [{ date: "Jan 1", newUsers: 3, newSubscribers: 1 }, ...]
export const LineGraph = ({ data = [] }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Activity (Last 7 Days)" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "New Subscribers",
        data: data.map((d) => d.newSubscribers),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "New Users",
        data: data.map((d) => d.newUsers),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "New Downloads",
        data: data.map((d) => d.newDownloads ?? 0),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded shadow border border-gray-200 h-[300px] sm:h-[360px] md:h-[420px]">
      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Loading graph...</p>
      ) : (
        <Line data={chartData} options={{ ...options, maintainAspectRatio: false }} />
      )}
    </div>
  );
};