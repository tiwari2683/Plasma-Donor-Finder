Plasma Donor Finder
A web application connecting plasma donors with requesters in real-time, built with React and Node.js. Facilitates donor matching, blood group compatibility, and secure communication.
🩸 Overview
Plasma Donor Finder bridges plasma donors and those in need with real-time matching, location-based search, and secure chat.
Key Features

Real-time Donor Matching: Matches donors by blood group and location
Blood Group Compatibility: Ensures safe donations
Location-based Search: GPS-enabled donor/requester search
Secure Chat: Real-time communication
Role-based Dashboards: Separate interfaces for donors and requesters
Profile Management: User profiles with location and stats
Request Management: Track donation requests and confirmations

🏗️ Tech Stack
Frontend

React.js: Modern UI with hooks
Tailwind CSS: Responsive styling
Socket.io: Real-time chat
React Router: Client-side navigation
React Toastify: Notifications

Backend

Node.js/Express.js: RESTful API
MongoDB/Mongoose: NoSQL database
Socket.io: Real-time communication
JWT: Secure authentication
Geolocation: Location services

## 🎥 Demo Video

<video controls>
  <source src="https://raw.githubusercontent.com/yourusername/plasma-donor-finder/main/assets/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

🚀 Prerequisites

Node.js (v14+)
npm or yarn
MongoDB (local or Atlas)
Git

📋 Requirements

RAM: 4GB (8GB recommended)
Storage: 2GB free
Network: Internet for geolocation
Browser: Modern, geolocation-enabled

🛠️ Installation

Clone Repository
git clone <repository-url>
cd plasma-donor-finder


Install Dependencies
# Backend
cd server
npm install

# Frontend
cd client
npm install


Environment Setup
Backend (server/.env):
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plasma-donor-finder
JWT_SECRET=your_jwt_secret
NODE_ENV=development

Frontend (client/.env):
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000


Database Setup

Local MongoDB: Install, start service, create plasma-donor-finder database
MongoDB Atlas: Create cluster, update MONGODB_URI


Run Application
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client
npm start



🎯 API Endpoints

Auth: /api/auth/register, /api/auth/login, /api/auth/verify
Profile: /api/profile, /api/profile/stats
Search: /api/search/donors, /api/search/recipients
Donation: /api/donation/request, /api/donation/confirm/:requesterId, /api/donation/nearby-requests
Chat: /api/chat/:userId, /api/chat/send
Notifications: /api/notifications, /api/notifications/mark-read

🩸 Blood Group Compatibility



Donor
Can Donate To



A+
A+, AB+


A-
A+, A-, AB+, AB-


B+
B+, AB+


B-
B+, B-, AB+, AB-


AB+
AB+


AB-
AB+, AB-


O+
A+, B+, AB+, O+


O-
All groups


🎨 UI Features

Donor Dashboard: View requests, confirm donations, track history
Requester Dashboard: Search donors, create requests, track status
Profile: Manage info, blood group, location, and stats

🔒 Security

JWT authentication
Bcrypt password hashing
Input validation
CORS protection
Rate limiting
Data encryption

📱 Responsive Design

Desktop, tablet, and mobile-friendly

🚀 Deployment
Heroku
heroku create your-app-name
heroku addons:create mongolab
git push heroku main

Vercel
cd client
vercel
cd server
vercel

🧪 Testing
# Backend
cd server
npm test

# Frontend
cd client
npm test

📊 Optimizations

Image lazy loading
Code splitting
Caching
Database indexing
CDN support

🐛 Troubleshooting

Connection: Verify MongoDB, network, .env
Auth: Clear cache, check JWT
Location: Enable GPS, verify permissions

🤝 Contributing

Fork repo
Create branch (git checkout -b feature/YourFeature)
Commit (git commit -m 'Add YourFeature')
Push (git push origin feature/YourFeature)
Open Pull Request

Guidelines:

Follow ESLint
Write clear commits
Include tests
Update docs

📄 License
MIT License - see LICENSE file.
🙏 Acknowledgments

React.js, Node.js, MongoDB, Socket.io, Tailwind CSS, React Icons

📞 Support

Email: support@plasmadonorfinder.com
Issues: GitHub Issues
Docs: Project wiki


Made with ❤️ for the community
