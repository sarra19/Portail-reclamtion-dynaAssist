import React, { useEffect, useState } from "react";
import Chart from "chart.js";
import SummaryApi from "api/common";


export default function TechnicianStatsHorizontalBar() {
  const [statsData, setStatsData] = useState({
    loading: true,
    error: null,
    technicians: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(SummaryApi.IntervStats.url, {
          method: SummaryApi.IntervStats.method,
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
            technicians: data.data.sort((a, b) => b.nombreInterventions - a.nombreInterventions)
          });
        } else {
          throw new Error(data.message || "Invalid data format");
        }
      } catch (error) {
        setStatsData({
          loading: false,
          error: error.message,
          technicians: []
        });
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (statsData.loading || statsData.error || statsData.technicians.length === 0) return;

    const techniciens = statsData.technicians.map(item => item.technicien || "Inconnu");
    const counts = statsData.technicians.map(item => item.nombreInterventions);

    // Couleurs personnalisées
    const backgroundColors = counts.map(count => {
      if (count === 0) return 'rgba(59, 130, 246, 0.3)'; // Bleu clair pour 0
      if (count >= 20) return '#3B82F6'; // Bleu foncé pour beaucoup d'interventions
      return '#3B82F6'; // Bleu moyen
    });

    const config = {
      type: "bar",
      data: {
        labels: techniciens,
        datasets: [{
          label: "Nombre d'interventions",
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: '#3B82F6',
          borderWidth: 1,
          hoverBackgroundColor: '#2563EB',
          hoverBorderColor: '#1E40AF',
          barThickness: 'flex',
          maxBarThickness: 30
        }]
      },
      options: {
        indexAxis: 'y', // Barres horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const tech = statsData.technicians[context.dataIndex];
                return [
                  `Interventions: ${context.raw}`,
                  `(${tech.pourcentage}% du total)`,
                  `Première: ${new Date(tech.premiereIntervention).toLocaleDateString()}`,
                  `Dernière: ${new Date(tech.derniereIntervention).toLocaleDateString()}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1,
              precision: 0
            },
            title: {
              display: true,
              text: "Nombre d'interventions",
              color: '#4B5563'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: '#4B5563'
            }
          }
        }
      }
    };

    const ctx = document.getElementById("horizontal-bar-chart");
    if (!ctx) return;
    
    const chartCtx = ctx.getContext("2d");
    
    if (window.myHorizontalBar) window.myHorizontalBar.destroy();
    window.myHorizontalBar = new Chart(chartCtx, config);

    return () => {
      if (window.myHorizontalBar) window.myHorizontalBar.destroy();
    };
  }, [statsData]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              Statistiques Interventions
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              Répartition des Interventions par Technicien
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        {statsData.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : statsData.error ? (
          <div className="text-center py-10 text-red-500">
            Erreur: {statsData.error}
          </div>
        ) : statsData.technicians.length === 0 ? (
          <div className="text-center py-10 text-blueGray-500">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <div className="relative" style={{ height: '500px' }}>
              <canvas id="horizontal-bar-chart"></canvas>
            </div>
            
            {/* Tableau récapitulatif */}
            <div className="mt-6 overflow-x-auto flex justify-center">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interventions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% du total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Première intervention</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière intervention</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statsData.technicians.map((tech, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tech.technicien}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.nombreInterventions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.pourcentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tech.premiereIntervention).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tech.derniereIntervention).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}