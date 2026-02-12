# Screen 4: Line Chart

Purpose:
Visualize wind forecast data and calculated power.

Data sources:
1. Open-Meteo API
   - Fetch wind speed data
2. n8n API
   - Input: wind speed
   - Output: power

Chart:
- Line chart
- X-axis: time
- Lines:
  - Wind speed
  - Power

Flow:
1. Fetch wind speed from Open-Meteo
2. Send wind speed to n8n API
3. Receive power values
4. Render line chart

Actions:
- Submit button

Submit:
- Save chart data to Google Sheet via n8n API
- If user does NOT submit → do NOT save