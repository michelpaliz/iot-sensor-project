/**
 * Main Dashboard Application
 */

import {
    createChartConfig,
    updateChart
} from './chart-utils.js';

// Chart instances and data
let temperatureChart, humidityChart;
let localTempHistory = [];
let localHumidityHistory = [];
let dynamicRangeEnabled = false;

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    dashboard: document.getElementById('dashboard'),
    sensorData: document.getElementById('sensorData'),
    dynamicRangeToggle: document.getElementById('dynamicRangeToggle'),
    toggleStatus: document.getElementById('toggleStatus')
};

/**
 * Updates both temperature and humidity charts
 * @param {Array} temperatureData 
 * @param {Array} humidityData 
 */
function updateCharts(temperatureData, humidityData) {
    validateData(temperatureData, humidityData);
    
    localTempHistory = temperatureData;
    localHumidityHistory = humidityData;

    const labels = generateTimeLabels(temperatureData.length);

    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    const tempConfig = createChartConfig(
        'line',
        labels,
        temperatureData,
        {
            label: 'Temperature (°C)',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            unit: '°C'
        },
        dynamicRangeEnabled
    );
    temperatureChart = updateChart(temperatureChart, tempConfig, tempCtx);

    // Humidity Chart
    const humCtx = document.getElementById('humidityChart').getContext('2d');
    const humConfig = createChartConfig(
        'line',
        labels,
        humidityData,
        {
            label: 'Humidity (%)',
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            unit: '%',
            suggestedMin: 0,
            suggestedMax: 100
        }
    );
    humidityChart = updateChart(humidityChart, humConfig, humCtx);

    updateSensorPanel();
}

// Helper functions
function validateData(tempData, humData) {
    if (!tempData || tempData.length === 0) {
        console.warn("No temperature data, using default");
        return [[0], [0]];
    }
    if (!humData || humData.length === 0) {
        console.warn("No humidity data, using default");
        return [tempData, [0]];
    }
    return [tempData, humData];
}

function generateTimeLabels(count) {
    return Array.from({length: count}, (_, i) => `T-${count - i}`);
}

function updateSensorPanel() {
    const now = new Date().toLocaleString();
    const latestTemp = localTempHistory.length > 0 ? 
        localTempHistory[localTempHistory.length - 1] : 'N/A';
    const latestHumidity = localHumidityHistory.length > 0 ? 
        localHumidityHistory[localHumidityHistory.length - 1] : 'N/A';

    elements.sensorData.innerHTML = `
        <div class="sensor-row">
            <span class="sensor-label">🌡️ Temperature:</span>
            <span class="sensor-value">${latestTemp} °C</span>
        </div>
        <div class="sensor-row">
            <span class="sensor-label">💧 Humidity:</span>
            <span class="sensor-value">${latestHumidity} %</span>
        </div>
        <div class="sensor-row">
            <span class="sensor-label">🕒 Last Update:</span>
            <span class="sensor-value">${now}</span>
        </div>
    `;
}

// Data loading functions
async function loadHistoryData() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const history = await response.json();
        if (!history.temperature || !history.humidity) {
            throw new Error("Invalid data format from API");
        }

        updateCharts(history.temperature, history.humidity);
        return true;
    } catch (err) {
        console.error("Error loading history data:", err);
        elements.sensorData.innerHTML = 
            `<div class="error">Error loading data: ${err.message}</div>`;
        return false;
    }
}

// UI Initialization
function initDynamicRangeToggle() {
    elements.dynamicRangeToggle.addEventListener('change', function() {
        dynamicRangeEnabled = this.checked;
        elements.toggleStatus.textContent = dynamicRangeEnabled ? 'ON' : 'OFF';
        elements.toggleStatus.classList.toggle('toggle-on', dynamicRangeEnabled);
        elements.toggleStatus.classList.toggle('toggle-off', !dynamicRangeEnabled);
        
        if (localTempHistory.length > 0) {
            updateCharts(localTempHistory, localHumidityHistory);
        }
    });
}

// Main initialization
window.addEventListener('DOMContentLoaded', async () => {
    initDynamicRangeToggle();

    const success = await loadHistoryData();
    elements.loading.style.display = 'none';
    elements.dashboard.style.display = success ? 'block' : 'none';
    
    if (!success) {
        elements.loading.innerHTML = `
            <h2>⚠️ Connection Error</h2>
            <p>Failed to load initial data. Retrying...</p>
        `;
    }

    const refreshInterval = setInterval(loadHistoryData, 10000);
    window.addEventListener('beforeunload', () => clearInterval(refreshInterval));
});