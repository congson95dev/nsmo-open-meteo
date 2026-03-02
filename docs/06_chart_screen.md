# Screen 4: Line Chart

Purpose:
Visualize wind forecast data and calculated power.

Data sources:
1. n8n API (`/calc-power`)
   - Output: wind speed and power

Chart:
- Line chart
- X-axis: time
- Lines:
  - Power
  - Wind speed
- Additional visualization:
  - Wind speed colored column on the right side axis
  - Comparison line uses the same color as wind speed column

Flow:
1. Call n8n `/calc-power` with selected section and config
2. Receive wind speed + power values
3. Render chart
