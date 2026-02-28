# Quick Start Guide

## 📦 Installation Complete!

All dependencies have been installed. Here's how to get started:

## 🚀 Quick Start (3 Steps)

### Step 1: Configure MongoDB

Edit `backend/.env` and set your MongoDB URI:

**Option A - Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/sadhna-tracker
```
Then start MongoDB: `mongod`

**Option B - MongoDB Atlas (Recommended):**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and update:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sadhna-tracker
```

### Step 2: Start the Application

**Option A - Use the startup script:**
```bash
cd sadhna-tracker
./start.sh
```

**Option B - Manual start:**

Terminal 1 (Backend):
```bash
cd sadhna-tracker/backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd sadhna-tracker/frontend
npm run dev
```

### Step 3: Open the App

Open [http://localhost:5173](http://localhost:5173) in your browser

## 🧪 Testing

1. **Register as Mentor**
   - Click "Sign Up"
   - Use phone format: +911234567890
   - Select role: "Mentor"

2. **Register as Devotee**
   - Logout and sign up again
   - Select role: "Devotee"
   - Choose your mentor

3. **Add Sadhna Entry**
   - Fill all fields
   - Submit and see your score!

4. **Test Mentor Features**
   - Login as mentor
   - View devotees' entries
   - Check weekly winners

## 📱 WhatsApp (Optional)

To enable WhatsApp messaging:

1. Create [Twilio account](https://www.twilio.com/)
2. Get WhatsApp sandbox or buy a number
3. Update `backend/.env`:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 📚 Documentation

- Full walkthrough: See `walkthrough.md` artifact
- API docs: See `README.md`
- Implementation plan: See `implementation_plan.md` artifact

## ✅ What's Included

- ✅ Complete authentication system
- ✅ 9 sadhna tracking fields with validations
- ✅ Automatic scoring algorithm
- ✅ Weekly winner leaderboard
- ✅ WhatsApp integration ready
- ✅ Mobile-responsive design
- ✅ Modern gradient UI
- ✅ Role-based access control

## 🎯 Project Location

```
/Users/ashish/.gemini/antigravity/scratch/sadhna-tracker/
```

Enjoy your Sadhna Tracker! 🙏
