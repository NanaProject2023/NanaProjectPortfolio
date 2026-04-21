Personal Finance Tracker
Personal Finance Tracker is a full-stack application designed to help users monitor their finances. Users can log individual financial items by entering a title, price, and toggling between expenses or profits. The app allows users to add, update, and delete entries securely, with full authentication.
Features
	•	Add Financial Items: Users input a title, amount, and choose whether it’s an expense or profit.
	•	CRUD Operations: Add, update, or delete financial entries, all tied to a user account.
	•	Authentication: Secure sign-up and login using JWT. Passwords are hashed using bcrypt, and tokens are stored in local storage for persistent login.
	•	Full-Stack Architecture: The backend is built with Node.js, Express, and PostgreSQL (pg), while the frontend uses React.js.
	•	Environment Variables: All sensitive data (e.g., DB credentials) is managed securely with dotenv.
	•	Themes: The app supports a light and dark mode, allowing users to toggle between themes for a personalized experience.
Tech Stack
	•	Frontend: React.js
	•	Backend: Node.js, Express
	•	Database: PostgreSQL (via pg)
	•	Security: bcrypt for password hashing, jsonwebtoken (JWT) for authentication
	•	Environment: dotenv for managing secrets
	•	State Management: Local storage for persisting JWT tokens
	•	UI: Theme toggling between light and dark mode for a better user experience.
Authentication
Users sign up with email and password. Upon login, a JWT token is generated, hashed passwords are stored safely with bcrypt, and tokens are kept in local storage. Each request is authorized using Bearer tokens in the header, ensuring that every user action is secure and tied to their account.
Features in Detail
	•	Add/Update/Delete: Users can modify or delete any financial entry they create, ensuring full
