# Plasma Donor Finder

A comprehensive web application that connects plasma donors with requesters in real-time. Built with React frontend and Node.js backend, this platform facilitates blood donation requests, donor matching, and secure communication between donors and requesters.

## 🎥 Demo Video

https://github.com/yourusername/plasma-donor-finder/assets/your-user-id/demo-video.mp4

*Watch the demo to see the application in action!*

## 🩸 Project Overview

**Plasma Donor Finder** is a full-stack web application designed to bridge the gap between plasma donors and those in need. The platform features real-time donor matching, blood group compatibility checking, location-based search, and secure chat functionality.

### Key Features
- **Real-time Donor Matching**: Find compatible donors based on blood group and location
- **Blood Group Compatibility**: Advanced compatibility checking for safe donations
- **Location-based Search**: GPS-enabled search with distance calculations
- **Secure Chat System**: Real-time communication between donors and requesters
- **Role-based Dashboard**: Separate interfaces for donors and requesters
- **Profile Management**: Comprehensive user profiles with location tracking
- **Request Management**: Track donation requests and confirmations

## 🏗️ Architecture

### Frontend
- **React.js**: Modern UI with functional components and hooks
- **Tailwind CSS**: Responsive design with custom styling
- **Socket.io**: Real-time chat functionality
- **React Router**: Client-side routing and navigation
- **React Toastify**: User notifications and feedback

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: RESTful API framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Socket.io**: Real-time bidirectional communication
- **JWT**: Secure authentication and authorization
- **Geolocation**: Location-based services and distance calculations

## 🚀 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

## 📋 System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Network**: Internet connection for geolocation services
- **Browser**: Modern browser with geolocation support

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd plasma-donor-finder
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd server
npm install
```

#### Frontend Dependencies
```bash
cd client
npm install
```

### 3. Environment Configuration

#### Backend Configuration
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plasma-donor-finder
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Frontend Configuration
Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

#### Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Create database: `plasma-donor-finder`

#### MongoDB Atlas (Cloud)
1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

### 5. Start the Application

#### Development Mode
```bash
# Start backend server
cd server
npm run dev

# Start frontend (in new terminal)
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/stats` - Get user statistics

### Donor Search
- `GET /api/search/donors` - Search for donors
- `GET /api/search/recipients` - Search for recipients

### Donation Management
- `POST /api/donation/request` - Create donation request
- `PUT /api/donation/confirm/:requesterId` - Confirm donation request
- `GET /api/donation/nearby-requests` - Get nearby requests
- `GET /api/donation/confirmed-requests` - Get confirmed requests
- `GET /api/donation/stats`