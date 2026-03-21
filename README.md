# Post Management Web App with Authentication

A full-stack post management web app with JWT authentication, CRUD operations, image upload, and user profiles.
---

## 🚀 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt for password hashing
- Multer (image upload)

### Deployment Ready
- Supports cloud storage for images (Cloudinary)
- Environment configuration via `.env` file
- Fully ready for deployment on Vercel

**Dev Tools:**
- Nodemon for hot-reload
- VS Code
- Postman for API testing

---

## ✨ Features

### Authentication
- User registration & login
- JWT-based authentication
- Protected routes
- Secure password hashing
- Logout functionality

### Posts Feed
- User profile page with editable info
- Create, read, update & delete posts
- Search & filter posts
-

### Posts Management
- Create posts from dashboard
- Update posts via profile section
- Delete posts
- Image upload support

---


## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/campusconnect.git
cd campusconnect
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create .env files:

#### Backend .env:

```bash
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend .env:

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the App

## Backend:

```bash
cd backend
npm run dev
```

## Frontend:

```bash
cd frontend
npm start
```

---

# 📂 Project Structure

### Backend

```bash
backend/
├─ src/
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ auth.controller.js
│  │  │  ├─ auth.routes.js
│  │  │  └─ auth.service.js
│  │  ├─ posts/
│  │  │  ├─ post.controller.js
│  │  │  ├─ post.model.js
│  │  │  └─ post.service.js
│  ├─ config/
│  │  └─ db.js
│  ├─ middlewares/
│  │  └─ error.middleware.js
│  └─ utils/
│     ├─ ApiError.js
│     └─ sendResponse.js
└─ server.js


### Frontend

frontend/
├─ src/
│  ├─ components/
│  │  ├─ Header.jsx
│  │  └─ PostCard.jsx
│  ├─ pages/
│  │  ├─ Dashboard.jsx 
│  │  └─ CreatePost.jsx
│  ├─ services/
│  │  ├─ auth.js
│  │  └─ posts.js
│  └─ App.jsx
└─ package.json
```

---


## 🔐 API Endpoints

### Auth
```bash
- POST `/api/auth/register`
- POST `/api/auth/login`
```

### Profile
```bash
- GET `/api/auth/profile`
- PUT `/api/auth/profile`
```

### Posts
```bash
- POST `/api/posts`
- GET `/api/posts`
- PUT `/api/posts/:id`
- DELETE `/api/posts/:id`
```

---

## 🧪 Testing
- APIs tested using **Postman**
- Authentication & CRUD verified with valid JWT tokens

---

## 📸 Screenshots

### Login Page

<img width="900" height="800" alt="image" src="https://github.com/user-attachments/assets/f317db04-c70b-43c3-ac6f-bda46a98ab6d" />


### Signup Page

<img width="900" height="800" alt="image" src="https://github.com/user-attachments/assets/c9898d79-abbb-44c9-b008-a8a952d4dcac" />


### Dashboard with Posts

<img width="900" height="800" alt="Screenshot 2025-12-15 173633" src="https://github.com/user-attachments/assets/380323cc-565f-4072-bc6a-4303a329a56d" />
<br/>
<br/>

<img width="900" height="800" alt="Screenshot 2025-12-15 173006" src="https://github.com/user-attachments/assets/47623387-8aac-458e-b81a-ca94423fe8d6" />


### Profile Page

<img width="900" height="800" alt="Screenshot 2025-12-15 173026" src="https://github.com/user-attachments/assets/db58fe9b-9934-4021-bfe7-43fe8dff9288" />

---

## 📈 Scalability Plan

- Modular folder structure for easy feature expansion
- Separate frontend and backend deployments
- JWT middleware for role-based access
- Pagination & indexing for large datasets
- Redis caching for frequently accessed data
- Docker for containerization
- CI/CD pipeline for automated deployments

---

## 👤 Author
**Naina Varshney**  
Frontend Developer Intern Candidate
