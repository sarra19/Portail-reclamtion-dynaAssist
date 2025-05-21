import React, { useEffect, useState } from "react";
import Chart from "chart.js";
import SummaryApi from "api/common";


export default function CardLineChart() {
  const [statsData, setStatsData] = useState({
    loading: true,
    error: null,
    monthlyData: []
  });

  // Fetch reclamation statistics by month
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(SummaryApi.reclamationStats.url, {
          method: SummaryApi.reclamationStats.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setStatsData({
            loading: false,
            error: null,
            monthlyData: data.data
          });
        } else {
          throw new Error(data.message || "Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching reclamation stats:", error);
        setStatsData({
          loading: false,
          error: error.message,
          monthlyData: []
        });
      }
    };

    fetchStats();
  }, []);

  // Initialize chart when data is loaded
  useEffect(() => {
    if (statsData.loading || statsData.error) return;

    const months = [
      "Janvier", "Février", "Mars", "Avril", 
      "Mai", "Juin", "Juillet", "Août",
      "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    // Prepare data for all months
    const prepareYearData = (year) => {
      const yearData = Array(12).fill(0);
      statsData.monthlyData
        .filter(item => item.year === year)
        .forEach(item => {
          yearData[item.month - 1] = item.count;
        });
      return yearData;
    };

    const currentYear = new Date().getFullYear();
    const currentYearData = prepareYearData(currentYear);
    const previousYearData = prepareYearData(currentYear - 1);

    const config = {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: currentYear,
            backgroundColor: "#3B82F6",
            borderColor: "#3B82F6",
            data: currentYearData,
            fill: false,
            tension: 0.4
          },
          {
            label: currentYear - 1,
            fill: false,
            backgroundColor: "#f74c27",
            borderColor: "#f74c27",
            data: previousYearData,
            tension: 0.4
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            labels: {
              fontColor: "white",
            },
            align: "end",
            position: "bottom",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw} réclamations`;
              }
            }
          }
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          x: {
            ticks: {
              fontColor: "rgba(255, 255, 255, 0.7)",
            },
            display: true,
            grid: {
              display: false,
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              fontColor: "rgba(255,255,255,.7)",
              precision: 0
            },
            display: true,
            grid: {
              color: "rgba(253, 250, 250, 0.15)",
              borderDash: [3],
              drawBorder: false,
            },
            title: {
              display: true,
              text: "Nombre de réclamations",
              color: "rgba(255,255,255,.7)"
            }
          },
        },
      },
    };

    const ctx = document.getElementById("line-chart").getContext("2d");
    
    // Destroy previous chart if exists
    if (window.myLine) {
      window.myLine.destroy();
    }

    window.myLine = new Chart(ctx, config);

    return () => {
      if (window.myLine) {
        window.myLine.destroy();
      }
    };
  }, [statsData]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-blueGray-700">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
              Statistiques Annuelles
            </h6>
            <h2 className="text-white text-xl font-semibold">
              Réclamations par Mois
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 mt-5 flex-auto">
        {statsData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : statsData.error ? (
          <div className="text-center py-10 text-red-400">
            Erreur: {statsData.error}
          </div>
        ) : (
          <div className="relative h-350-px">
            <canvas id="line-chart"></canvas>
          </div>
        )}
      </div>
    </div>
  );
}