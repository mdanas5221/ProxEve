
# ProxEve

> Connect. Cache. Accelerate.

ProxEve is an AI API caching proxy designed to help developers reduce repeated AI API costs and improve response times by serving cached responses when possible.

🚧 **Project Status:** In Development

---

## 📌 About the Project

ProxEve aims to provide a simple way for developers to integrate AI APIs through a caching proxy.

Instead of sending every request directly to an AI provider, ProxEve will check whether a suitable cached response is available.

### Planned Request Flow

```text
Your Application
       |
       v
    ProxEve
       |
       v
  Cache Check
    /     \
  HIT     MISS
   |        |
Cached    AI Provider
Response     |
             v
        Save Response
             |
             v
        Return Result
```

---

## ✨ Current Features

### Authentication
- User Signup
- User Signin
- Password Hashing using bcrypt
- Session-based Authentication
- Automatic Login after Signup
- Logout and Session Destruction
- Authentication Middleware
- Protected Dashboard Routes

### Dashboard Routing
- Dashboard Overview
- Projects Route
- API Keys Route
- Usage Route
- Settings Route
- Documentation Route
- Dynamic Resource Routes using IDs

### Current Route Structure

```text
/dashboard
/dashboard/projects
/dashboard/projects/:id
/dashboard/api-keys
/dashboard/api-keys/:id
/dashboard/usage
/dashboard/settings
/dashboard/documentation
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Templating Engine:** EJS
- **Authentication:** Express-session
- **Password Hashing:** bcrypt
- **Frontend:** HTML, CSS, JavaScript
- **Version Control:** Git & GitHub

---

## 📂 Project Structure

```text
ProxEve/
├── config/
│   └── db.js
├── middlewares/
│   └── auth.middleware.js
├── models/
│   └── user.js
├── public/
│   ├── css/
│   └── js/
├── routes/
│   ├── auth.routes.js
│   └── dashboard.routes.js
├── views/
│   ├── auth/
│   ├── dashboard/
│   ├── partials/
│   └── index.ejs
├── .env
├── .gitignore
├── app.js
├── package.json
└── package-lock.json
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mdanas5221/ProxEve.git
```

### 2. Navigate to the Project

```bash
cd ProxEve
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URL=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret
PORT=temperary_port
```

### 5. Start the Development Server

```bash
npm run dev
```

Or:

```bash
node app.js
```

---

## 🗺️ Roadmap

- [x] User Signup
- [x] User Signin
- [x] Password Hashing
- [x] Session-based Authentication
- [x] Logout Functionality
- [x] Authentication Middleware
- [x] Protected Dashboard Routes
- [x] Dashboard Route Organization
- [ ] Connect Dashboard with Real Database Data
- [ ] Project Management
- [ ] API Key Management
- [ ] Usage Tracking
- [ ] Request Logging
- [ ] AI Proxy Endpoint
- [ ] Exact Response Caching
- [ ] OpenAI API Integration
- [ ] BYOK (Bring Your Own Key)
- [ ] Cost and Usage Analytics
- [ ] Semantic Caching
- [ ] Production Deployment

---

## 🎯 Project Goals

ProxEve is being developed with the following goals:

- Reduce unnecessary repeated AI API requests.
- Improve response speed for cached requests.
- Provide a simple integration experience.
- Help developers monitor AI API usage.
- Build a lightweight and developer-friendly AI infrastructure product.

---

## 👨‍💻 Developer

**Md Anas**

Building ProxEve while learning backend development, system design, and AI infrastructure.

---

## 📜 License

This project is currently under development. Licensing details will be added later.