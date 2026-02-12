# Screen 2: Register

UI:
- Username
- Password
- Confirm password
- Register button
- Link back to Login

Flow:
1. Validate:
   - Password === Confirm password
2. Hash or encode password on frontend
3. Send username + hashed password to n8n API
4. Show success or error message

Rules:
- Never send plain password
- No password strength requirement
- No reset password screen