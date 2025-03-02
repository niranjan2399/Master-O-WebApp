import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import moment from "moment";

const metricsOptions = [
  { title: "Start Time", value: "start_time" },
  { title: "End Time", value: "end_time" },
  { title: "Duration", value: "duration" },
  { title: "Total Moves", value: "total_moves" },
  { title: "Score", value: "score" },
];

const CustomReport = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([
    "start_time",
    "end_time",
    "duration",
    "total_moves",
    "score",
  ]);
  const [reportData, setReportData] = useState([]);
  const [lineChartData, setLineChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);

  const handleMetricChange = (metric) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const updateChartData = (data) => {
    const labels = data?.map((row) =>
      moment(row.start_time).format("DD-MM-YY HH:MM")
    );
    const durations = data?.map((row) => row.duration);
    const score = data?.map((row) => row.score);
    setLineChartData({
      labels: labels,
      datasets: [
        {
          label: "Duration",
          data: durations,
          borderWidth: 1,
        },
      ],
    });

    setBarChartData({
      labels,
      datasets: [
        {
          label: "Score",
          data: score,
          borderWidth: 1,
        },
      ],
    });
  };

  const generateReport = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/report/custom`,
        {
          metrics: selectedMetrics,
        }
      );
      setReportData(response?.data?.sessions);

      if (response.data.sessions.length > 0) {
        updateChartData(response.data.sessions);
      }
    } catch (err) {
      window.alert(err?.response?.data?.error || "Something went wrong!");
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/report/export-csv`,
        { metrics: selectedMetrics },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "game_report.csv";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      window.alert("Error downloading CSV:");
    }
  };

  useEffect(() => {
    generateReport();
  }, [selectedMetrics]);

  return (
    <div className="custom-report-container">
      <a href="/" className="back">
        🔙 Back
      </a>

      <h2>Custom Reports</h2>

      <div className="metrics-selection">
        {metricsOptions?.map((metric, i) => (
          <label key={i}>
            <input
              type="checkbox"
              value={metric?.value}
              checked={selectedMetrics.includes(metric?.value)}
              onChange={() => handleMetricChange(metric?.value)}
            />
            {metric?.title}
          </label>
        ))}
      </div>

      <div className="report-buttons">
        <button onClick={generateReport}>Generate Report</button>
        <button onClick={downloadCSV} disabled={!selectedMetrics.length}>
          Download CSV
        </button>
      </div>

      {reportData?.length && selectedMetrics.includes("start_time") && (
        <div className="charts-container">
          <h3>Graphical Representation</h3>
          <div className="charts">
            {selectedMetrics.includes("score") && (
              <div className="chart">
                <Bar data={barChartData} />
              </div>
            )}
            {selectedMetrics.includes("duration") && (
              <div className="chart">
                <Line data={lineChartData} />
              </div>
            )}
            {!selectedMetrics.includes("score") &&
              !selectedMetrics.includes("duration") &&
              "Select Duration or Score to view graph"}
          </div>
        </div>
      )}

      {reportData.length > 0 && (
        <div className="report-table-container">
          <table>
            <thead>
              <tr>
                {selectedMetrics.map((metric) => (
                  <th key={metric}>{metric}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  {selectedMetrics.map((metric) => (
                    <td key={metric}>{row[metric]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomReport;
