# Hari Smriti - MERN Application

A professional spiritual practice tracking system built with the MERN stack and Material UI.

## Features

- 🔐 **Authentication**: Secure login/signup with JWT
- 👥 **Role-Based Access**: Mentor and Devotee roles
- 📝 **Daily Tracking**: Track spiritual practices with detailed metrics
- 🏆 **Weekly Winners**: Automatic scoring and leaderboard
- 💬 **WhatsApp Integration**: Send reminders via Twilio
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🎨 **Modern UI**: Beautiful gradients and animations

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Twilio for WhatsApp
- Express Validator

### Frontend
- React 18
- Material UI (MUI)
- React Router v6
- Axios
- Date-fns

## Project Structure

```
sadhna-tracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── pages/       # Route pages
        ├── context/     # React Context
        ├── services/    # API services
        └── App.jsx      # Main component
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Twilio account (for WhatsApp)

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Usage

### For Devotees
1. Sign up with devotee role and select your mentor
2. Add daily sadhna entries
3. View your progress on the dashboard
4. Track your statistics

### For Mentors
1. Sign up with mentor role
2. View all devotees' entries
3. See weekly winners and leaderboard
4. Send WhatsApp reminders to devotees who haven't submitted

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/mentors` - Get all mentors

### Sadhna Entries
- `POST /api/sadhna` - Create/update entry
- `GET /api/sadhna/my-entries` - Get user's entries
- `GET /api/sadhna/devotees-entries` - Get devotees' entries (mentor)
- `GET /api/sadhna/weekly-winner` - Get weekly leaderboard (mentor)
- `GET /api/sadhna/missing-submissions` - Get devotees who haven't submitted (mentor)
- `DELETE /api/sadhna/:id` - Delete entry

### WhatsApp (Mentor Only)
- `POST /api/whatsapp/send` - Send single message
- `POST /api/whatsapp/send-bulk` - Send bulk messages
- `POST /api/whatsapp/send-reminder` - Send reminder to missing devotees

## Database Schema

### User Model
- name, email, password (hashed)
- phone (for WhatsApp)
- role (mentor/devotee)
- mentorId (reference to mentor)

### SadhnaEntry Model
- userId (reference to user)
- date, wakeUpTime, sleepTime
- roundsChanted (integer)
- bookName (enum)
- readingDuration (float, minutes)
- serviceDuration (float, hours)
- serviceType (string)
- hearingDuration (float, hours)
- totalScore (auto-calculated)

## Scoring Algorithm

The scoring system awards points as follows:
- 10 points per round chanted
- 0.5 points per minute of reading
- 20 points per hour of service
- 15 points per hour of hearing
- 50 bonus points for waking up before 4:00 AM

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For support, email support@sadhnatracker.com or open an issue on GitHub.

---

Built with ❤️ for the spiritual community
