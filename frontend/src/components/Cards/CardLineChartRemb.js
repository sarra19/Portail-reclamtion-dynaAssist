import React, { useEffect, useState } from "react";
import Chart from "chart.js";
import SummaryApi from "api/common";


export default function CardLineChartRemb() {
  const [statsData, setStatsData] = useState({
    loading: true,
    error: null,
    monthlyData: []
  });

  // Formatage des nombres pour l'affichage (ex: 1000 → "1 000")
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Fetch remboursement statistics by month
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(SummaryApi.rembStats.url, {
          method: SummaryApi.rembStats.method,
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
        console.error("Error fetching remboursement stats:", error);
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
    if (statsData.loading || statsData.error || statsData.monthlyData.length === 0) return;

    const months = [
      "Janvier", "Février", "Mars", "Avril", 
      "Mai", "Juin", "Juillet", "Août",
      "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    // Organiser les données par année
    const yearsData = {};
    statsData.monthlyData.forEach(item => {
      if (!yearsData[item.annee]) {
        yearsData[item.annee] = Array(12).fill(0);
      }
      yearsData[item.annee][item.mois - 1] = item.totalMontant;
    });

    // Créer les datasets pour chaque année
    const datasets = Object.keys(yearsData)
      .sort((a, b) => b - a) // Tri décroissant pour avoir les années récentes en premier
      .map((year, index) => {
        const colors = [
          { bg: "#3B82F6", border: "#3B82F6" }, // Bleu
          { bg: "#f74c27", border: "#f74c27" }, // Orange
          { bg: "#10B981", border: "#10B981" }, // Vert
          { bg: "#8B5CF6", border: "#8B5CF6" }, // Violet
        ];
        
        return {
          label: year,
          backgroundColor: colors[index]?.bg || "#3B82F6",
          borderColor: colors[index]?.border || "#3B82F6",
          data: yearsData[year],
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        };
      });

    const config = {
      type: "line",
      data: {
        labels: months,
        datasets: datasets,
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
              usePointStyle: true,
              padding: 20
            },
            align: "end",
            position: "bottom",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${formatNumber(context.raw)} €`;
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
              callback: function(value) {
                return formatNumber(value) + " €";
              }
            },
            display: true,
            grid: {
              color: "rgba(253, 250, 250, 0.15)",
              borderDash: [3],
              drawBorder: false,
            },
            title: {
              display: true,
              text: "Montant des remboursements",
              color: "rgba(255,255,255,.7)"
            }
          },
        },
      },
    };

    const ctx = document.getElementById("line-chart-remb").getContext("2d");
    
    // Destroy previous chart if exists
    if (window.myLineRemb) {
      window.myLineRemb.destroy();
    }

    window.myLineRemb = new Chart(ctx, config);

    return () => {
      if (window.myLineRemb) {
        window.myLineRemb.destroy();
      }
    };
  }, [statsData]);

  // Calcul des totaux pour affichage
  const calculateTotals = () => {
    if (!statsData.monthlyData.length) return null;

    const totals = {};
    statsData.monthlyData.forEach(item => {
      if (!totals[item.annee]) {
        totals[item.annee] = 0;
      }
      totals[item.annee] += item.totalMontant;
    });

    return totals;
  };

  const yearlyTotals = calculateTotals();

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-blueGray-700">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
              Statistiques Remboursements
            </h6>
            <h2 className="text-white text-xl font-semibold">
              Montant des Remboursements par Mois
            </h2>
          </div>
        </div>
      </div>
      
      {/* Affichage des totaux annuels */}
      {yearlyTotals && (
        <div className="px-4 py-2 flex flex-wrap gap-4">
          {Object.entries(yearlyTotals)
            .sort(([a], [b]) => b - a)
            .map(([year, total]) => (
              <div key={year} className="bg-blueGray-800 px-3 py-2 rounded">
                <span className="text-blueGray-300 text-sm">Total {year}: </span>
                <span className="text-white font-semibold">
                  {formatNumber(total.toFixed(2))} TND
                </span>
              </div>
            ))}
        </div>
      )}
      
      <div className="p-4 flex-auto">
        {statsData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : statsData.error ? (
          <div className="text-center py-10 text-red-400">
            Erreur: {statsData.error}
          </div>
        ) : statsData.monthlyData.length === 0 ? (
          <div className="text-center py-10 text-blueGray-300">
            Aucune donnée de remboursement disponible
          </div>
        ) : (
          <div className="relative h-350-px">
            <canvas id="line-chart-remb"></canvas>
          </div>
        )}
      </div>
    </div>
  );
}