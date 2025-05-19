

/**
 * Chart Utilities - Helper functions for chart management
 */

/**
 * Calculates dynamic range showing ±3°C around current temperature
 * @param {Array} data - Temperature data points
 * @returns {Object} {min, max} range values
 */
export function calculateDynamicRange(data) {
    if (!data || data.length === 0) return { min: 0, max: 10 };
    
    const currentTemp = data[data.length - 1]; // Get most recent temperature
    const range = 3; // Shows ±3 degrees (e.g., 26-32 for 29°C)
    
    return {
        min: Math.floor(currentTemp - range),
        max: Math.ceil(currentTemp + range)
    };
}

/**
 * Creates chart configuration with enhanced y-axis ticks
 * @param {string} type - Chart type ('line', 'bar', etc.)
 * @param {Array} labels - X-axis labels
 * @param {Array} data - Chart data points
 * @param {Object} options - Chart options
 * @param {boolean} [dynamicRange=false] - Whether to apply dynamic range
 * @returns {Object} Chart configuration
 */
export function createChartConfig(type, labels, data, options, dynamicRange = false) {
    const config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: options.label,
                data: data,
                borderColor: options.borderColor,
                backgroundColor: options.backgroundColor,
                borderWidth: options.borderWidth || 2,
                tension: options.tension || 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: options.beginAtZero || false,
                    title: {
                        display: true,
                        text: options.unit
                    }
                }
            }
        }
    };

    if (dynamicRange) {
        const range = calculateDynamicRange(data);
        config.options.scales.y.min = range.min;
        config.options.scales.y.max = range.max;
        
        // Enhanced tick marks for better readability
        config.options.scales.y.ticks = {
            stepSize: 0.5,  // Show marks every 0.5°C
            callback: function(value) {
                // Only label whole numbers to reduce clutter
                return value % 1 === 0 ? value + '°C' : '';
            }
        };
    } else if (options.suggestedMin !== undefined) {
        config.options.scales.y.suggestedMin = options.suggestedMin;
    }
    if (options.suggestedMax !== undefined) {
        config.options.scales.y.suggestedMax = options.suggestedMax;
    }

    return config;
}

/**
 * Updates an existing chart or creates new one
 * @param {Chart} chart - Chart instance to update
 * @param {Object} config - Chart configuration
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @returns {Chart} Updated chart instance
 */
export function updateChart(chart, config, ctx) {
    if (chart) {
        chart.destroy();
    }
    return new Chart(ctx, config);
}