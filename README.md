# MPMS Backend - Minimal Project Management System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A production-ready RESTful API for project management with JWT authentication, role-based access control, and comprehensive reporting.

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[API Documentation](#-api-documentation) •
[Deployment](#-deployment)

</div>

---

## 🔗 Live Demo

- **API Base URL:** [https://mpms-backend.vercel.app](https://mpms-backend.vercel.app)
- **Health Check:** [https://mpms-backend.vercel.app/api/v1/health](https://mpms-backend.vercel.app/api/v1/health)

---

## 🚀 Features

### Authentication & Authorization

- 🔐 JWT-based authentication (Access + Refresh tokens)
- 👥 Role-based access control (Admin, Manager, Member)
- 🍪 Secure HTTP-only cookies
- 🔄 Token refresh mechanism

### Project Management

- 📁 Full CRUD operations for projects
- 👨‍👩‍👧‍👦 Team member management
- 📊 Project progress tracking
- 🏷️ Status management (Planned, Active, Completed, Archived)

### Sprint Management

- 🏃 Sprint creation with auto-increment numbering
- 📅 Date-based sprint planning
- 🔄 Sprint reordering
- 📈 Sprint progress statistics

### Task Management

- ✅ Complete task lifecycle management
- 📋 Subtasks support
- ⏱️ Time logging
- 🎯 Priority levels (Low, Medium, High, Urgent)
- 📊 Kanban board data endpoint
- 📝 Activity logging
- 📎 File attachments (Cloudinary)
- ✍️ Review workflow

### Comments & Collaboration

- 💬 Threaded comments on tasks
- ✏️ Edit/Delete own comments
- 📜 Comment history

### Reports & Analytics

- 📊 Dashboard statistics
- 📈 Project progress reports
- 👤 User productivity reports
- ⏰ Time log reports

---

## 🛠️ Tech Stack

| Category           | Technology                |
| ------------------ | ------------------------- |
| **Runtime**        | Node.js 18+               |
| **Language**       | TypeScript 5.x            |
| **Framework**      | Express.js 4.x            |
| **Database**       | MongoDB with Mongoose 8.x |
| **Authentication** | JSON Web Tokens (JWT)     |
| **Validation**     | Zod                       |
| **File Upload**    | Multer + Cloudinary       |
| **Email**          | Nodemailer                |
| **Code Quality**   | ESLint + Prettier + Husky |

---

## 📁 Project Structure

```
src/
├── config/                    # Configuration files
│   ├── index.ts              # Environment variables with Zod validation
│   ├── database.ts           # MongoDB connection setup
│   └── cloudinary.ts         # Cloudinary configuration
│
├── modules/                   # Feature-based modules
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── index.ts
│   │
│   ├── user/                 # User management
│   ├── project/              # Project management
│   ├── sprint/               # Sprint management
│   ├── task/                 # Task management
│   ├── comment/              # Comments system
│   └── report/               # Reports & analytics
│
├── shared/                    # Shared utilities
│   ├── constants/            # Application constants & enums
│   ├── errors/               # Custom error classes
│   ├── interfaces/           # TypeScript interfaces
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.ts          # Authentication & authorization
│   │   ├── validateRequest.ts
│   │   ├── globalErrorHandler.ts
│   │   └── upload.ts
│   └── utils/                # Helper functions
│       ├── catchAsync.ts
│       ├── sendResponse.ts
│       └── pagination.ts
│
├── app.ts                     # Express app configuration
├── server.ts                  # Server entry point
├── routes.ts                  # Route aggregator
└── seed.ts                    # Database seeder
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB 6+ (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/mpms-backend.git
   cd mpms-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**

   ```env
   # Application
   NODE_ENV=development
   PORT=5000
   API_PREFIX=/api/v1

   # Database
   DATABASE_URL=mongodb://localhost:27017/mpms

   # JWT Secrets (use strong random strings in production)
   JWT_ACCESS_SECRET=your-access-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Seed the database (optional)**

   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000/api/v1`

---

## 📜 Available Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot reload |
| `npm run build`      | Build for production                     |
| `npm run start:prod` | Start production server                  |
| `npm run seed`       | Seed database with test data             |
| `npm run lint`       | Run ESLint                               |
| `npm run lint:fix`   | Fix ESLint errors                        |
| `npm run prettier`   | Format code with Prettier                |

---

## 🔑 Test Credentials

After running the seeder, use these credentials:

| Role    | Email            | Password    |
| ------- | ---------------- | ----------- |
| Admin   | admin@mpms.com   | Password123 |
| Manager | manager@mpms.com | Password123 |
| Member  | john@mpms.com    | Password123 |
| Member  | jane@mpms.com    | Password123 |

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint                  | Description           | Access    |
| ------ | ------------------------- | --------------------- | --------- |
| POST   | `/auth/register`          | Register new user     | Public    |
| POST   | `/auth/login`             | Login user            | Public    |
| POST   | `/auth/logout`            | Logout user           | Protected |
| POST   | `/auth/refresh-token`     | Refresh access token  | Public    |
| GET    | `/auth/me`                | Get current user      | Protected |
| POST   | `/auth/admin/create-user` | Create user with role | Admin     |

### User Endpoints

| Method | Endpoint                 | Description           | Access         |
| ------ | ------------------------ | --------------------- | -------------- |
| GET    | `/users`                 | Get all users         | Admin, Manager |
| GET    | `/users/:id`             | Get user by ID        | Admin, Manager |
| GET    | `/users/profile`         | Get own profile       | Protected      |
| PATCH  | `/users/profile`         | Update own profile    | Protected      |
| POST   | `/users/change-password` | Change password       | Protected      |
| PATCH  | `/users/:id`             | Update user           | Admin          |
| PATCH  | `/users/:id/role`        | Update user role      | Admin          |
| DELETE | `/users/:id`             | Delete user           | Admin          |
| GET    | `/users/team-members`    | Get team members list | Protected      |
| GET    | `/users/stats`           | Get user statistics   | Admin          |

### Project Endpoints

| Method | Endpoint                     | Description            | Access         |
| ------ | ---------------------------- | ---------------------- | -------------- |
| GET    | `/projects`                  | Get all projects       | Admin, Manager |
| GET    | `/projects/my-projects`      | Get user's projects    | Protected      |
| POST   | `/projects`                  | Create project         | Admin, Manager |
| GET    | `/projects/:idOrSlug`        | Get project by ID/slug | Protected      |
| GET    | `/projects/:idOrSlug/stats`  | Get project with stats | Protected      |
| PATCH  | `/projects/:id`              | Update project         | Admin, Manager |
| DELETE | `/projects/:id`              | Delete project         | Admin          |
| POST   | `/projects/:id/team-members` | Add team members       | Admin, Manager |
| DELETE | `/projects/:id/team-members` | Remove team members    | Admin, Manager |

### Sprint Endpoints

| Method | Endpoint                              | Description                     | Access         |
| ------ | ------------------------------------- | ------------------------------- | -------------- |
| POST   | `/sprints`                            | Create sprint                   | Admin, Manager |
| GET    | `/sprints/project/:projectId`         | Get sprints by project          | Protected      |
| GET    | `/sprints/project/:projectId/all`     | Get all sprints (no pagination) | Protected      |
| GET    | `/sprints/project/:projectId/active`  | Get active sprint               | Protected      |
| PATCH  | `/sprints/project/:projectId/reorder` | Reorder sprints                 | Admin, Manager |
| GET    | `/sprints/:id`                        | Get sprint by ID                | Protected      |
| GET    | `/sprints/:id/stats`                  | Get sprint with stats           | Protected      |
| PATCH  | `/sprints/:id`                        | Update sprint                   | Admin, Manager |
| DELETE | `/sprints/:id`                        | Delete sprint                   | Admin, Manager |

### Task Endpoints

| Method | Endpoint                           | Description                | Access         |
| ------ | ---------------------------------- | -------------------------- | -------------- |
| GET    | `/tasks`                           | Get all tasks with filters | Protected      |
| GET    | `/tasks/my-tasks`                  | Get assigned tasks         | Protected      |
| POST   | `/tasks`                           | Create task                | Admin, Manager |
| GET    | `/tasks/:id`                       | Get task by ID             | Protected      |
| PATCH  | `/tasks/:id`                       | Update task                | Admin, Manager |
| PATCH  | `/tasks/:id/status`                | Update task status         | Protected      |
| POST   | `/tasks/:id/log-time`              | Log time on task           | Protected      |
| DELETE | `/tasks/:id`                       | Delete task                | Admin, Manager |
| PATCH  | `/tasks/bulk-update`               | Bulk update tasks          | Protected      |
| GET    | `/tasks/project/:projectId`        | Get tasks by project       | Protected      |
| GET    | `/tasks/project/:projectId/kanban` | Get kanban board data      | Protected      |
| GET    | `/tasks/sprint/:sprintId`          | Get tasks by sprint        | Protected      |
| POST   | `/tasks/:id/subtasks`              | Add subtask                | Protected      |
| PATCH  | `/tasks/:id/subtasks/:subtaskId`   | Update subtask             | Protected      |
| DELETE | `/tasks/:id/subtasks/:subtaskId`   | Delete subtask             | Protected      |

### Comment Endpoints

| Method | Endpoint                     | Description                      | Access    |
| ------ | ---------------------------- | -------------------------------- | --------- |
| GET    | `/comments/task/:taskId`     | Get comments by task             | Protected |
| GET    | `/comments/task/:taskId/all` | Get all comments (no pagination) | Protected |
| POST   | `/comments/task/:taskId`     | Create comment                   | Protected |
| PATCH  | `/comments/:id`              | Update comment                   | Protected |
| DELETE | `/comments/:id`              | Delete comment                   | Protected |

### Report Endpoints

| Method | Endpoint                      | Description              | Access         |
| ------ | ----------------------------- | ------------------------ | -------------- |
| GET    | `/reports/dashboard`          | Get dashboard statistics | Admin, Manager |
| GET    | `/reports/my-report`          | Get personal report      | Protected      |
| GET    | `/reports/project/:projectId` | Get project report       | Admin, Manager |
| GET    | `/reports/user/:userId`       | Get user report          | Admin, Manager |
| GET    | `/reports/time-logs`          | Get time log report      | Admin, Manager |

### Query Parameters

Most GET endpoints support these query parameters:

| Parameter    | Type            | Description                            |
| ------------ | --------------- | -------------------------------------- |
| `page`       | number          | Page number (default: 1)               |
| `limit`      | number          | Items per page (default: 10, max: 100) |
| `sortBy`     | string          | Field to sort by                       |
| `sortOrder`  | 'asc' \| 'desc' | Sort direction                         |
| `searchTerm` | string          | Search in title/name/description       |

### Response Format

**Success Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "path": "email", "message": "Invalid email format" }]
}
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Framework Preset: Other

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   Add all variables from `.env.example` in Vercel's Environment Variables section.

5. **Deploy**

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
4. Add environment variables
5. Deploy

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for anywhere)
4. Get connection string and add to `DATABASE_URL`

---

## 🔒 Security Best Practices

- ✅ JWT tokens with short expiry
- ✅ HTTP-only cookies for refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Rate limiting (recommended for production)
- ✅ Helmet.js (recommended for production)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Muhammed Rakibul Hasan - [GitHub](https://github.com/rakibul58)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

</div>
