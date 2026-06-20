/**
 * EcoTrack - Chart.js Configuration and Helper Utilities
 * Styling optimized for glassmorphic dark theme.
 */

let categoryChartInstance = null;
let historyChartInstance = null;

// Palette matching our CSS custom properties
const COLORS = {
    transport: '#06b6d4', // Cyan
    energy: '#f59e0b',    // Amber
    food: '#10b981',      // Emerald
    waste: '#ef4444',     // Danger
    gridLines: 'rgba(255, 255, 255, 0.05)',
    text: '#9ca3af',
    textLight: '#f3f4f6'
};

/**
 * Initializes/Updates the Category Breakdown Doughnut Chart.
 * @param {HTMLCanvasElement} canvas - Canvas element to render the chart
 * @param {Object} data - Category carbon values { transport, energy, food, waste }
 */
function updateCategoryChart(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const values = [
        data.transport || 0,
        data.energy || 0,
        data.food || 0,
        data.waste || 0
    ];
    
    // Check if we have any data, if all are zero render a placeholder state
    const total = values.reduce((a, b) => a + b, 0);
    const chartData = total === 0 ? [1, 1, 1, 1] : values;
    const chartColors = total === 0 ? 
        ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'] : 
        [COLORS.transport, COLORS.energy, COLORS.food, COLORS.waste];

    if (categoryChartInstance) {
        categoryChartInstance.data.datasets[0].data = chartData;
        categoryChartInstance.data.datasets[0].backgroundColor = chartColors;
        categoryChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
            if (total === 0) return ' No data logged';
            const categories = ['Transportation', 'Energy', 'Food', 'Waste'];
            const val = values[context.dataIndex];
            const pct = ((val / total) * 100).toFixed(0);
            return ` ${categories[context.dataIndex]}: ${val.toFixed(1)} kg CO2e (${pct}%)`;
        };
        categoryChartInstance.update();
        return;
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Energy', 'Food', 'Waste'],
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#0a1211',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false // We will render a custom HTML legend for better styling control
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 18, 17, 0.9)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 1,
                    titleColor: COLORS.textLight,
                    bodyColor: COLORS.text,
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            if (total === 0) return ' No data logged';
                            const val = values[context.dataIndex];
                            const pct = ((val / total) * 100).toFixed(0);
                            return ` ${val.toFixed(1)} kg CO2e (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initializes/Updates the Weekly Trend Bar Chart.
 * @param {HTMLCanvasElement} canvas - Canvas element to render the chart
 * @param {Array<Object>} last7DaysData - Structured array containing [{date: "Mon", co2: 12.4}, ...]
 */
function updateHistoryChart(canvas, last7DaysData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = last7DaysData.map(d => d.label);
    const values = last7DaysData.map(d => d.co2);

    // Create a beautiful glowing gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.85)'); // Vibrant emerald
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');  // Translucent cyan

    if (historyChartInstance) {
        historyChartInstance.data.labels = labels;
        historyChartInstance.data.datasets[0].data = values;
        historyChartInstance.update();
        return;
    }

    historyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Footprint',
                data: values,
                backgroundColor: gradient,
                borderRadius: 6,
                borderWidth: 0,
                barPercentage: 0.55,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 18, 17, 0.9)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 1,
                    titleColor: COLORS.textLight,
                    bodyColor: COLORS.text,
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.raw.toFixed(1)} kg CO2e`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: COLORS.text,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: COLORS.gridLines,
                        drawTicks: false
                    },
                    ticks: {
                        color: COLORS.text,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        },
                        callback: function(value) {
                            return value + ' kg';
                        }
                    },
                    border: {
                        dash: [5, 5]
                    }
                }
            }
        }
    });
}

/**
 * Destroys current chart instances on app teardown if needed.
 */
function destroyCharts() {
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
    }
    if (historyChartInstance) {
        historyChartInstance.destroy();
        historyChartInstance = null;
    }
}
