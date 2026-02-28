import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required for WhatsApp notifications'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code']
    },
    role: {
        type: String,
        enum: ['mentor', 'devotee'],
        required: [true, 'Role is required'],
        default: 'mentor'
    },
    // Array of mentor IDs — allows a devotee to have multiple mentors
    mentorId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    devoteeType: {
        type: String,
        enum: ['full_time_service', 'student'],
        required: function () {
            return this.role === 'devotee';
        },
        default: 'full_time_service'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
