# Screen 1: Login

UI:
- Username input
- Password input
- Login button
- Link to Register screen

Flow:
1. User enters username & password
2. Call n8n API to fetch user info
3. From API response:
   - Retrieve stored password hash or encoded password
4. Verify password:
   - Hash or decode input password
   - Compare with API result
5. If valid → login success
6. If invalid → show error message

Rules:
- Do NOT store plain password
- Do NOT auto-login
- No reset password feature