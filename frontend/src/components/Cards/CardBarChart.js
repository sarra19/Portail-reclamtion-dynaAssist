import React, { useEffect, useState } from "react";
import Chart from "chart.js";
import SummaryApi from "api/common";


export default function CardBarChart() {
  const [statsData, setStatsData] = useState({
    loading: true,
    error: null,
    productsByVendor: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(SummaryApi.productsByVendorStats.url, {
          method: SummaryApi.productsByVendorStats.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setStatsData({
            loading: false,
            error: null,
            productsByVendor: data.data.sort((a, b) => b.productCount - a.productCount)
          });
        } else {
          throw new Error(data.message || "Invalid data format");
        }
      } catch (error) {
        setStatsData({
          loading: false,
          error: error.message,
          productsByVendor: []
        });
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (statsData.loading || statsData.error || statsData.productsByVendor.length === 0) return;

    const vendors = statsData.productsByVendor.map(item => item.vendorName || "Inconnu");
    const counts = statsData.productsByVendor.map(item => item.productCount);

    // Couleur #f74c27 pour toutes les barres, avec transparence pour 0 produit
    const backgroundColors = counts.map(count => 
      count === 0 ? 'rgba(247, 76, 39, 0.3)' : '#f74c27'
    );

    const borderColors = counts.map(count => 
      count === 0 ? 'rgba(247, 76, 39, 0.5)' : '#f74c27'
    );

    const config = {
      type: "bar",
      data: {
        labels: vendors,
        datasets: [{
          label: "Nombre de produits",
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          data: counts,
          barThickness: 'flex',
          maxBarThickness: 40,
          minBarLength: 2
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.raw} produit(s)`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { 
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#4A5568',
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: '#E2E8F0',
              drawBorder: false
            }
          }
        }
      }
    };

    const ctx = document.getElementById("bar-chart");
    if (!ctx) return;
    
    const chartCtx = ctx.getContext("2d");
    
    if (window.myBar) window.myBar.destroy();
    window.myBar = new Chart(chartCtx, config);

    return () => {
      if (window.myBar) window.myBar.destroy();
    };
  }, [statsData]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              Statistiques Produits
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              Répartition par Fournisseur
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 mt-8 flex-auto">
        {statsData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : statsData.error ? (
          <div className="text-center py-10 text-red-500">
            Erreur: {statsData.error}
          </div>
        ) : statsData.productsByVendor.length === 0 ? (
          <div className="text-center py-10 text-blueGray-500">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="relative" style={{ height: '400px' }}>
            <canvas id="bar-chart" height="400"></canvas>
          </div>
        )}
      </div>
    </div>
  );
}