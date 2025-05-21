import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js";
import SummaryApi from "api/common";


export default function CardPieChart() {
  const [stats, setStats] = useState({
    admin: 0,
    fournisseur: 0,
    client: 0,
    totalUsers: 0,
    loading: true,
    error: null
  });

  const chartRef = useRef(null);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch(SummaryApi.getUserStats.url, {
          method: SummaryApi.getUserStats.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setStats({
            admin: data.data.adminCount,
            fournisseur: data.data.fournisseurCount,
            client: data.data.clientCount,
            totalUsers: data.data.totalUsers,
            loading: false,
            error: null
          });
        } else {
          throw new Error(data.message || "Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchUserStats();
  }, []);

  // Initialize chart when stats change
  useEffect(() => {
    if (stats.loading || stats.error) return;

    const ctx = chartRef.current.getContext('2d');

    // Destroy previous chart if exists
    if (window.myPie) {
      window.myPie.destroy();
    }

    const config = {
      type: "pie",
      data: {
        labels: ["Admin", "Fournisseur", "Client"],
        datasets: [
          {
            data: [stats.admin, stats.fournisseur, stats.client],
            backgroundColor: [
              "#f74c27",
              "#10B981", 
              "#3B82F6",
            ],
            hoverBackgroundColor: [
              "#DC2626",
              "#059669",
              "#273987",
            ],
            borderWidth: 1,
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 14
              },
              color: '#6B7280'
            }
          },
          tooltip: {
            backgroundColor: "rgb(255,255,255)",
            bodyColor: "#4B5563",
            titleColor: "#111827",
            borderColor: "#E5E7EB",
            borderWidth: 1,
            padding: 15,
            displayColors: true,
            caretPadding: 10,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      },
    };

    window.myPie = new Chart(ctx, config);

    return () => {
      if (window.myPie) {
        window.myPie.destroy();
      }
    };
  }, [stats]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              Statistiques des Utilisateurs
            </h6>
            <div className="flex justify-between items-center">
              <h2 className="text-blueGray-700 text-xl font-semibold">
                Répartition des Utilisateurs
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        {stats.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : stats.error ? (
          <div className="text-center py-10 text-red-500">
            Erreur: {stats.error}
          </div>
        ) : (
          <div className="relative h-350-px">
            <canvas 
              ref={chartRef}
              height="350"
            ></canvas>
          </div>
        )}
         {!stats.loading && !stats.error && (
                <span className="flex justify-end bg-blue-100 text-blueGray-600 mb-1 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Total: {stats.totalUsers}
                </span>
              )}
      </div>
    </div>
  );
}