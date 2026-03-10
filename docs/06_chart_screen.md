# Screen 4: Line Chart

Purpose:
Visualize wind forecast data and calculated power.

Data sources:
1. n8n API (`/calc-power`)
   - Output: wind speed and power

Chart:
- Line chart
- Single route: `/chart` (no period in path)
- Page title changes by selected period:
  - hourly: `Dự báo chu kỳ tới`
  - daily: `Dự báo ngày tới`
  - weekly: `Dự báo tuần tới`
- Show 3 period buttons and reload chart data on click:
  - `Dự báo chu kỳ tới`
  - `Dự báo ngày tới`
  - `Dự báo tuần tới`
  - While loading after user click, show a spinner icon in the clicked button
- Show `Xuất file Excel` button to export XLSX file by selected period:
  - hourly -> template `CongSuatDuBao_IAH_15Phut_Template.xlsx`
  - daily -> template `CongSuatDuBao_DAH_15Phut_Template.xlsx`
  - weekly -> template `CongSuatDuBao_WAH_Template.xlsx`
  - Disable export button while chart is loading
- X-axis: actual time from API `/calc-power` response (`time[]`), aligned by index with each row in `rows[]`
- Lines:
  - Power (`kW`) on left Y-axis
  - Wind speed (`m/s`) on right Y-axis
- Additional visualization:
  - Wind speed colored column on the right side axis
  - Comparison line uses the same color as wind speed column

Header:
- Show plant name in top bar center (between app title and right menu): `Nhà máy Điện gió Tân Hợp`

Flow:
1. Call n8n `/calc-power` with selected section and config
2. Receive wind speed + power values
3. Render chart
