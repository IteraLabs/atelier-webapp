// ---------------------------------------------------------------------------
// Mock data from Rust Hawkes estimation pipeline run
// These will be replaced by API calls once the backend is available.
// ---------------------------------------------------------------------------

import type {
  EventTimestamp,
  ForecastVsActual,
  DiagnosticMetric,
  FailureEvent,
} from "@/types/model"

// Intensity time-series (simulated step-function sampled from fitted intensity)
export const intensityTimeSeries = [
  0.42, 0.45, 0.71, 1.12, 1.58, 1.34, 0.98, 0.87, 0.76, 0.64,
  0.58, 0.52, 0.68, 1.24, 1.89, 2.14, 1.72, 1.31, 1.08, 0.91,
  0.79, 0.65, 0.54, 0.48, 0.72, 1.45, 1.92, 1.68, 1.22, 0.95,
  0.82, 0.71, 0.63, 0.57, 0.51, 0.88, 1.56, 2.31, 1.94, 1.42,
]

export const forecastSeries = [
  1.42, 1.28, 1.15, 1.04, 0.95, 0.88, 0.82, 0.77, 0.73, 0.70,
  0.68, 0.66, 0.64, 0.63, 0.62, 0.61, 0.60, 0.60, 0.59, 0.59,
]

// BTC/USDT order book event stream (dummy)
export const eventTimestamps: EventTimestamp[] = [
  { time: "10:51:34.857", type: "buy", price: 51234.50, size: 0.120, intensity: 0.42 },
  { time: "10:51:35.069", type: "sell", price: 51234.25, size: 0.085, intensity: 0.45 },
  { time: "10:51:35.504", type: "buy", price: 51234.75, size: 0.200, intensity: 0.71 },
  { time: "10:51:35.625", type: "buy", price: 51235.00, size: 0.340, intensity: 1.12 },
  { time: "10:51:35.747", type: "sell", price: 51234.50, size: 0.150, intensity: 1.58 },
  { time: "10:51:36.180", type: "buy", price: 51234.75, size: 0.095, intensity: 1.34 },
  { time: "10:51:36.823", type: "sell", price: 51234.25, size: 0.180, intensity: 0.98 },
  { time: "10:51:37.505", type: "buy", price: 51234.50, size: 0.110, intensity: 0.87 },
  { time: "10:51:38.069", type: "sell", price: 51234.00, size: 0.260, intensity: 0.76 },
  { time: "10:51:38.736", type: "buy", price: 51234.25, size: 0.075, intensity: 0.64 },
]

// Branching matrix (buy/sell/cancel self/cross-excitation)
export const branchingMatrix = [
  [0.27, 0.15, 0.04],
  [0.18, 0.31, 0.09],
  [0.06, 0.11, 0.22],
]

// Forecast vs Actual comparison (from pipeline Section 9)
export const forecastVsActual: ForecastVsActual[] = [
  { i: 1, actualDt: 1.0, forecastDt: 1211.28, diff: -1210.28 },
  { i: 2, actualDt: 4.0, forecastDt: 1480.61, diff: -1476.61 },
  { i: 3, actualDt: 5.0, forecastDt: 1619.54, diff: -1614.54 },
  { i: 4, actualDt: 6.0, forecastDt: 1722.20, diff: -1716.20 },
  { i: 5, actualDt: 7.0, forecastDt: 2424.84, diff: -2417.84 },
  { i: 6, actualDt: 8.0, forecastDt: 2934.18, diff: -2926.18 },
  { i: 7, actualDt: 9.0, forecastDt: 4271.47, diff: -4262.47 },
  { i: 8, actualDt: 11.0, forecastDt: 4709.46, diff: -4698.46 },
  { i: 9, actualDt: 12.0, forecastDt: 5012.15, diff: -5000.15 },
  { i: 10, actualDt: 21.0, forecastDt: 5215.13, diff: -5194.13 },
  { i: 11, actualDt: 22.0, forecastDt: 5280.02, diff: -5258.02 },
  { i: 12, actualDt: 54.0, forecastDt: 5558.15, diff: -5504.15 },
  { i: 13, actualDt: 62.0, forecastDt: 6319.73, diff: -6257.73 },
  { i: 14, actualDt: 150.0, forecastDt: 7069.78, diff: -6919.78 },
  { i: 15, actualDt: 214.0, forecastDt: 8344.19, diff: -8130.19 },
  { i: 16, actualDt: 220.0, forecastDt: 8619.67, diff: -8399.67 },
  { i: 17, actualDt: 221.0, forecastDt: 8732.21, diff: -8511.21 },
  { i: 18, actualDt: 223.0, forecastDt: 9414.92, diff: -9191.92 },
  { i: 19, actualDt: 399.0, forecastDt: 9433.92, diff: -9034.92 },
  { i: 20, actualDt: 2145.0, forecastDt: 9724.63, diff: -7579.63 },
]

// Diagnostics from pipeline
export const diagnosticMetrics: DiagnosticMetric[] = [
  { label: "Log-Likelihood", value: "-58,589.63" },
  { label: "AIC", value: "117,185.26" },
  { label: "BIC", value: "117,207.24" },
  { label: "Residuals Mean", value: "1.000076" },
  { label: "Residuals Std Dev", value: "1.075846" },
  { label: "Compensator Ratio", value: "1.0001" },
]

// Failure event log
export const failureEvents: FailureEvent[] = [
  {
    id: "F-001",
    timestamp: "2026-02-18 10:52:11",
    type: "Forecast Accuracy",
    severity: "critical",
    message: "Hawkes forecast MAE = 5,265.20ms vs actual mean gap 189.70ms (27.8x overshoot)",
    detail: "All 20 test-set forecasts overestimate inter-arrival times by orders of magnitude. Mean forecast gap = 5,454.90ms vs mean actual = 189.70ms. Hawkes MAE is 153.7% worse than Poisson baseline.",
    resolved: false,
  },
  {
    id: "F-002",
    timestamp: "2026-02-18 10:51:58",
    type: "Model Comparison",
    severity: "warning",
    message: "Poisson baseline outperforms Hawkes on out-of-sample forecasting",
    detail: "Poisson MAE = 2,075.66ms, RMSE = 2,324.63ms vs Hawkes MAE = 5,265.20ms, RMSE = 5,888.47ms. Despite Hawkes winning on in-sample fit (AIC lower by 25,531), it fails on forward prediction.",
    resolved: false,
  },
  {
    id: "F-003",
    timestamp: "2026-02-18 10:51:34",
    type: "Data Gap",
    severity: "warning",
    message: "Large timestamp gaps detected in trade arrivals",
    detail: "2 gaps exceeding 5.0s threshold: index 337 (5,249ms), index 3715 (5,047ms). May affect intensity estimation near gap boundaries.",
    resolved: false,
  },
  {
    id: "F-004",
    timestamp: "2026-02-18 10:51:34",
    type: "Data Quality",
    severity: "info",
    message: "8,857 duplicate timestamps removed from 20,102 raw trades",
    detail: "Source: bybit/btcusdt/trades_bybit_20260218_105134.846.parquet. Duplicates removed before inter-arrival computation. 11,245 unique arrivals retained.",
    resolved: true,
  },
  {
    id: "F-005",
    timestamp: "2026-02-17 16:42:10",
    type: "MLE Convergence",
    severity: "critical",
    message: "Previous run: MLE failed after 100,000 iterations (gradient norm 3.183e+0)",
    detail: "Resolved by adjusting heuristic initialization. Current run converged in 20,994 iterations.",
    resolved: true,
  },
]
