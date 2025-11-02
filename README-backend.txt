Inventory Manager - Node.js + MongoDB backend
--------------------------------------------

How to run:

1. Make sure you have Node.js (>=18) and MongoDB installed and running locally, or provide a MongoDB URI.
2. Copy .env.example to .env and edit MONGO_URI if needed.
3. Install dependencies:
   npm install
4. Start server:
   npm start
5. Open the app in browser:
   http://localhost:3000/

Notes:
- Authentication is implemented using a simple token (the user's MongoDB _id) returned on login/register.
  The frontend stores the token and sends it as: Authorization: Bearer <token>.
- This is a minimal integration to keep changes to the frontend small. Passwords are stored in plain text (as in the original demo).
