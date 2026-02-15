# API Calls & Response Documentation

> Complete analysis of all backend API calls, request parameters, response structures, and data mappings used across the project.

---

## Table of Contents

1. [Proxy Configuration](#proxy-configuration)
2. [Overview APIs](#overview-apis)
   - [Overview Summary](#1-overview-summary)
   - [Discharge Stations (Overview)](#2-discharge-stations-overview)
   - [AWS Stations (Overview)](#3-aws-stations-overview)
   - [Rain Gauge Stations (Overview)](#4-rain-gauge-stations-overview)
3. [Report APIs](#report-apis)
   - [Discharge Station Report](#5-discharge-station-report)
   - [AWS Station Report](#6-aws-station-report)
   - [Rain Gauge Station Report](#7-rain-gauge-station-report)
4. [Export APIs](#export-apis)
   - [Discharge Station Export (PDF)](#8-discharge-station-export-pdf)
   - [Discharge Station Export (Excel)](#9-discharge-station-export-excel)
   - [AWS Station Export (PDF)](#10-aws-station-export-pdf)
   - [AWS Station Export (Excel)](#11-aws-station-export-excel)
   - [Rain Gauge Export (PDF)](#12-rain-gauge-export-pdf)
   - [Rain Gauge Export (Excel)](#13-rain-gauge-export-excel)
5. [Error Handling](#error-handling)
6. [Data Mapping Summary](#data-mapping-summary)

---

## Proxy Configuration

All API calls are proxied through Next.js rewrites configured in `next.config.ts`:

| Frontend Path | Backend Destination |
|---|---|
| `/api/external/:path*` | `${BACKEND_URL}/api/:path*` |

**Environment Variable:**

```env
BACKEND_URL=http://103.248.122.182:8000
```

**Example:** A frontend call to `/api/external/overview/summary` is rewritten to `http://103.248.122.182:8000/api/overview/summary`.

---

## Overview APIs

These endpoints power the main Overview/Dashboard page. They are called in parallel on page mount and polled every **5 minutes** (silent re-fetch, no loader).

### 1. Overview Summary

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/overview/summary` |
| **Backend Path** | `/api/overview/summary` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchOverviewSummary()` |
| **Page** | `app/overview/page.tsx` |
| **Request Params** | None |

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "tab": "overview",
  "entity": {
    "discharge_stations": 8,
    "aws": 3,
    "rain_gauge_stations": 9,
    "juddo_pond_level": 5,
    "juddo_forbay_level": 3
  }
}
```

#### Field Mapping (API → Frontend)

| API Field | Frontend Field | Display |
|---|---|---|
| `entity.discharge_stations` | `metrics[0].value` | Padded to 2 digits (e.g. `"08"`) |
| `entity.aws` | `metrics[1].value` | Padded to 2 digits |
| `entity.rain_gauge_stations` | `metrics[2].value` | Padded to 2 digits |
| `entity.juddo_pond_level` | `metrics[3].value` | Padded to 2 digits |
| `entity.juddo_forbay_level` | `metrics[4].value` | Padded to 2 digits |

---

### 2. Discharge Stations (Overview)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/overview/discharge_stations` |
| **Backend Path** | `/api/overview/discharge_stations` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchDischargeStationsFromAPI()`, `fetchDischargeStationNames()` |
| **Pages** | `app/overview/page.tsx`, `app/station-data/page.tsx` |
| **Request Params** | None |

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "name": "Syana Chatti Yamuna River",
      "discharge": 12.50,
      "velocity": 3.20,
      "water_level": 1.80
    }
  ]
}
```

#### Field Mapping (API → Frontend)

| API Field | Frontend Field | Type | Format |
|---|---|---|---|
| `name` | `title` | `string` | As-is |
| `name` | `chartKey` | `string` | Initials (e.g. "SCYR") |
| `name` | `id` (report page) | `string` | Used as station identifier for report API |
| `discharge` | `discharge` | `string` | `.toFixed(2)` |
| `velocity` | `velocity` | `string` | `.toFixed(2)` |
| `water_level` | `waterLevel` | `string` | `.toFixed(2)` |
| *(derived)* | `color` | `string` | Cycled: `blue`, `orange`, `green`, `yellow` |
| *(derived)* | `id` (overview) | `string` | `ds-001`, `ds-002`, etc. |

---

### 3. AWS Stations (Overview)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/overview/aws` |
| **Backend Path** | `/api/overview/aws` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchAWSFromAPI()`, `fetchAWSStationNames()` |
| **Pages** | `app/overview/page.tsx`, `app/automatic-weather/page.tsx` |
| **Request Params** | None |

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "station_name": "Yamuna AWS",
      "temperature": 25.30,
      "humidity": 65.00,
      "pressure": 1013.25,
      "wind_speed": 4.50,
      "wind_direction": 180.00,
      "rainfall_day": 0.00,
      "rainfall_hour": 0.00,
      "rainfall_total": 12.50
    }
  ]
}
```

#### Field Mapping (API → Frontend)

| API Field | Frontend Field | Type | Format |
|---|---|---|---|
| `station_name` | `title` / `id` (report) | `string` | As-is |
| `station_name` | `chartKey` | `string` | Same as `station_name` |
| `temperature` | `temperature` | `string` | `.toFixed(2)` |
| `humidity` | `relativeHumidity` | `string` | `.toFixed(2)` |
| `pressure` | `airPressure` | `string` | `.toFixed(2)` |
| `wind_speed` | `windSpeed` | `string` | `.toFixed(2)` |
| `wind_direction` | `windDirection` | `string` | `.toFixed(2)` |
| `rainfall_day` | `rainfallDay` | `string` | `.toFixed(2)` |
| `rainfall_hour` | `rainfallHR` | `string` | `.toFixed(2)` |
| `rainfall_total` | `rainfallTotal` | `string` | `.toFixed(2)` |
| *(not in API)* | `solarRadiation` | `string` | Hardcoded `"0.00"` |
| *(derived)* | `color` | `string` | Cycled: `blue`, `green`, `orange` |

---

### 4. Rain Gauge Stations (Overview)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/overview/rain_gauges` |
| **Backend Path** | `/api/overview/rain_gauges` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchRainGaugesFromAPI()`, `fetchRainGaugeStationNames()` |
| **Pages** | `app/overview/page.tsx`, `app/rain-gauge-reports/page.tsx` |
| **Request Params** | None |

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "name": "Mussoorie",
      "hour": 0.50,
      "total": 125.30
    }
  ]
}
```

#### Field Mapping (API → Frontend)

| API Field | Frontend Field | Type | Format |
|---|---|---|---|
| `name` | `title` / `id` (report) | `string` | As-is |
| `name` | `chartKey` | `string` | Initials from CamelCase split |
| `hour` | `rainfallHR` | `string` | `.toFixed(2)` |
| `total` | `rainfallTotal` | `string` | `.toFixed(2)` |
| *(derived)* | `color` | `string` | Cycled: `blue`, `green`, `orange`, `yellow` |

---

## Report APIs

These endpoints provide time-series data for the report pages. They support pagination and time range filtering. Maximum time range: **7 days** (enforced client-side).

### 5. Discharge Station Report

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/discharge-stations` |
| **Backend Path** | `/api/discharge-stations` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchDischargeStationReport()` |
| **Page** | `app/station-data/page.tsx` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) | `2026-02-15T00:00:00` |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) | `2026-02-15T22:45:00` |
| `station` | `string` | ✅ | Station name | `Syana Chatti Yamuna River` |
| `page` | `number` | ❌ | Page number (default: `1`) | `1` |
| `page_size` | `number` | ❌ | Results per page (default: `100`) | `100` |

> **Note:** When multiple stations are selected, the frontend makes **parallel API calls** (one per station) and merges the results client-side.

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "timestamp": "2026-02-15T10:30:00",
      "station": "Syana Chatti Yamuna River",
      "discharge": 12.50,
      "velocity": 3.20,
      "water_level": 1.80
    }
  ]
}
```

#### Field Mapping (API → Table)

| API Field | Table Column | Type | Format |
|---|---|---|---|
| *(derived)* | `sno` (S.No) | `number` | Auto-increment after merge |
| `timestamp` | `timestamp` (TimeStamp) | `string` | As-is |
| `station` | `river` (River / Station) | `string` | As-is |
| `discharge` | `discharge` (Discharge) | `string` | `.toFixed(2)` |
| `velocity` | `velocity` (Velocity) | `string` | `.toFixed(2)` |
| `water_level` | `waterLevel` (Water Level) | `string` | `.toFixed(2)` |

---

### 6. AWS Station Report

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/aws-stations` |
| **Backend Path** | `/api/aws-stations` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchAWSStationReport()` |
| **Page** | `app/automatic-weather/page.tsx` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) | `2026-02-15T00:00:00` |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) | `2026-02-15T22:45:00` |
| `stations` | `string` | ✅ | Station name | `Yamuna AWS` |
| `page` | `number` | ❌ | Page number (default: `1`) | `1` |
| `page_size` | `number` | ❌ | Results per page (default: `100`) | `100` |

> **Note:** Parameter name is `stations` (plural) unlike Discharge which uses `station` (singular). Multiple stations: parallel calls, one per station.

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "timestamp": "2026-02-15T10:30:00",
      "station": "Yamuna AWS",
      "temperature": 25.30,
      "humidity": 65.00,
      "pressure": 1013.25,
      "wind_speed": 4.50,
      "wind_direction": 180.00,
      "rainfall_day": 0.00,
      "rainfall_hour": 0.00,
      "rainfall_total": 12.50
    }
  ]
}
```

#### Field Mapping (API → Table)

| API Field | Table Column | Type | Format |
|---|---|---|---|
| *(derived)* | `sno` (S.No) | `number` | Auto-increment |
| `timestamp` | `timestamp` (TimeStamp) | `string` | As-is |
| `station` | `station` (Station) | `string` | As-is |
| `temperature` | `temperature` (Temperature °C) | `string` | `.toFixed(2)` |
| `humidity` | `humidity` (Humidity %RH) | `string` | `.toFixed(2)` |
| `pressure` | `pressure` (Pressure hPa) | `string` | `.toFixed(2)` |
| `wind_speed` | `windSpeed` (Wind Speed m/s) | `string` | `.toFixed(2)` |
| `wind_direction` | `windDirection` (Wind Dir) | `string` | `.toFixed(2)` |
| `rainfall_day` | `rainfallDay` (Rainfall Day mm) | `string` | `.toFixed(2)` |
| `rainfall_hour` | `rainfallHour` (Rainfall HR mm) | `string` | `.toFixed(2)` |
| `rainfall_total` | `rainfallTotal` (Rainfall Total mm) | `string` | `.toFixed(2)` |

---

### 7. Rain Gauge Station Report

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/rain-gauge-stations/list` |
| **Backend Path** | `/api/rain-gauge-stations/list` |
| **Method** | `GET` |
| **Used In** | `dataService.ts → fetchRainGaugeStationReport()` |
| **Page** | `app/rain-gauge-reports/page.tsx` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) | `2026-02-15T00:00:00` |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) | `2026-02-15T22:45:00` |
| `page` | `number` | ❌ | Page number (default: `1`) | `1` |
| `page_size` | `number` | ❌ | Results per page (default: `100`) | `100` |

> **Note:** Unlike Discharge/AWS, this API does **not** accept a station filter parameter. It returns data for **ALL stations**. The frontend filters client-side using the selected station names.

#### Response Structure

```json
{
  "status": 200,
  "message": "Success",
  "entity": [
    {
      "timestamp": "2026-02-15T10:30:00",
      "station": "Mussoorie",
      "hour": 0.50,
      "total": 125.30
    }
  ]
}
```

#### Field Mapping (API → Table)

| API Field | Table Column | Type | Format |
|---|---|---|---|
| *(derived)* | `sno` (S.No) | `number` | Auto-increment after filter |
| `timestamp` | `timestamp` (TimeStamp) | `string` | As-is |
| `station` | `station` (Station) | `string` | As-is |
| `hour` | `rainfallHour` (Rainfall HR mm) | `string` | `.toFixed(2)` |
| `total` | `rainfallTotal` (Rainfall Total mm) | `string` | `.toFixed(2)` |

---

## Export APIs

These endpoints return binary file downloads (PDF or Excel). They require station selection and time range. Maximum time range: **7 days** (enforced client-side — buttons disabled beyond 7 days).

### 8. Discharge Station Export (PDF)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/discharge-stations/export/pdf` |
| **Backend Path** | `/api/discharge-stations/export/pdf` |
| **Method** | `GET` |
| **Response Type** | Binary (PDF blob) |
| **Downloaded As** | `discharge-station-report.pdf` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) |
| `stations` | `string` | ✅ (repeated) | Station name — **one query param per station** |

**Example URL:**
```
/api/external/discharge-stations/export/pdf?start_time=2026-02-15T00:00:00&end_time=2026-02-15T22:00:00&stations=Syana+Chatti+Yamuna+River&stations=Ganga+River
```

---

### 9. Discharge Station Export (Excel)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/discharge-stations/export/excel` |
| **Backend Path** | `/api/discharge-stations/export/excel` |
| **Method** | `GET` |
| **Response Type** | Binary (XLSX blob) |
| **Downloaded As** | `discharge-station-report.xlsx` |

**Request Parameters:** Same as [Discharge PDF Export](#8-discharge-station-export-pdf).

---

### 10. AWS Station Export (PDF)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/aws-stations/export/pdf` |
| **Backend Path** | `/api/aws-stations/export/pdf` |
| **Method** | `GET` |
| **Response Type** | Binary (PDF blob) |
| **Downloaded As** | `aws-station-report.pdf` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) |
| `stations` | `string` | ✅ (repeated) | Station name — one query param per station |

---

### 11. AWS Station Export (Excel)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/aws-stations/export/excel` |
| **Backend Path** | `/api/aws-stations/export/excel` |
| **Method** | `GET` |
| **Response Type** | Binary (XLSX blob) |
| **Downloaded As** | `aws-station-report.xlsx` |

**Request Parameters:** Same as [AWS PDF Export](#10-aws-station-export-pdf).

---

### 12. Rain Gauge Export (PDF)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/rain-gauge-stations/export/pdf` |
| **Backend Path** | `/api/rain-gauge-stations/export/pdf` |
| **Method** | `GET` |
| **Response Type** | Binary (PDF blob) |
| **Downloaded As** | `rain-gauge-report.pdf` |

#### Request Parameters (Query String)

| Parameter | Type | Required | Description |
|---|---|---|---|
| `start_time` | `string` | ✅ | Start timestamp (ISO without TZ) |
| `end_time` | `string` | ✅ | End timestamp (ISO without TZ) |
| `stations` | `string` | ✅ (repeated) | Station name — one query param per station |

---

### 13. Rain Gauge Export (Excel)

| Property | Value |
|---|---|
| **Frontend Path** | `/api/external/rain-gauge-stations/export/excel` |
| **Backend Path** | `/api/rain-gauge-stations/export/excel` |
| **Method** | `GET` |
| **Response Type** | Binary (XLSX blob) |
| **Downloaded As** | `rain-gauge-report.xlsx` |

**Request Parameters:** Same as [Rain Gauge PDF Export](#12-rain-gauge-export-pdf).

---

## Error Handling

### Overview APIs (Dashboard)

| Scenario | Frontend Behavior |
|---|---|
| API returns non-200 status | Throws error — red "Data not received – API failed" banner shown |
| Network failure / timeout | Same as above |
| On initial load failure | Data stays `null`, cards and charts show "No data available" |
| On polling failure | Existing data preserved, error banner shown, auto-retries in 5 min |

### Report APIs (Tables)

| Scenario | Frontend Behavior |
|---|---|
| API returns non-200 status | Error state shown in table area |
| Time range > 7 days | Red warning banner, Generate/Export buttons disabled, API call prevented |
| End time before start time | Red warning banner, buttons disabled |

### Export APIs (PDF/Excel)

| Scenario | Frontend Behavior |
|---|---|
| API returns non-200 status | Red toast notification in top-right: error message |
| Successful download | Green toast notification: "PDF/Excel downloaded successfully!" |
| During download | Button shows spinner + "Downloading..." text, button disabled |
| Toast auto-dismiss | After 4 seconds |

---

## Data Mapping Summary

### Timestamp Format

All timestamps sent to the backend use the format:

```
YYYY-MM-DDTHH:mm:ss
```

Example: `2026-02-15T00:00:00` (no timezone info, treated as local time).

### Station Identification

| Station Type | ID Strategy | Notes |
|---|---|---|
| Discharge | Station name string | `"Syana Chatti Yamuna River"` |
| AWS | Station name string | `"Yamuna AWS"` |
| Rain Gauge | Station name string | `"Mussoorie"` |

> Station IDs are the actual station **names** returned from the overview API, passed directly to the report/export APIs.

### Common Response Envelope

All API responses follow this structure:

```json
{
  "status": <number>,
  "message": "<string>",
  "entity": <data>
}
```

- `status` — HTTP-like status code
- `message` — Human-readable message
- `entity` — The actual data payload (object or array)

### Client-Side Constraints

| Constraint | Value | Enforcement |
|---|---|---|
| Max time range | 7 days | Client-side validation in `ReportPage.tsx` |
| Default start time | Today 00:00:00 | Set in `ReportPage.tsx` state init |
| Default end time | Current time | Set in `ReportPage.tsx` state init |
| Polling interval | 5 minutes | Overview page only |
| Export file types | PDF (`.pdf`), Excel (`.xlsx`) | All 3 station types |

---

## File References

| File | Role |
|---|---|
| `next.config.ts` | Proxy rewrite rules + `BACKEND_URL` env |
| `.env` | `BACKEND_URL` environment variable |
| `app/services/dataService.ts` | All API fetch functions |
| `app/overview/page.tsx` | Overview dashboard (polling + error handling) |
| `app/station-data/page.tsx` | Discharge report + export |
| `app/automatic-weather/page.tsx` | AWS report + export |
| `app/rain-gauge-reports/page.tsx` | Rain gauge report + export |
| `app/components/ReportPage.tsx` | Shared report UI (time range, export buttons, validation) |
