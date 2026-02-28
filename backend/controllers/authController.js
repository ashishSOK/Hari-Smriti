import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, mentorId, devoteeType } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // If devotee, verify all selected mentors exist
        let mentorIds = [];
        if (role === 'devotee' && mentorId) {
            mentorIds = Array.isArray(mentorId) ? mentorId : [mentorId];
            const mentors = await User.find({ _id: { $in: mentorIds }, role: 'mentor' });
            if (mentors.length !== mentorIds.length) {
                return res.status(400).json({ message: 'One or more invalid mentor IDs' });
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role,
            mentorId: role === 'devotee' ? mentorIds : [],
            devoteeType: role === 'devotee' ? (devoteeType || 'full_time_service') : undefined
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                mentorId: user.mentorId,
                devoteeType: user.devoteeType,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            mentorId: user.mentorId,
            devoteeType: user.devoteeType,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, devoteeType, mentorIds } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (user.role === 'devotee' && devoteeType) user.devoteeType = devoteeType;

        // Allow overriding the entire mentor array
        if (user.role === 'devotee' && mentorIds !== undefined) {
            const mIds = Array.isArray(mentorIds) ? mentorIds : [];
            // Optional: Verify mentors exist if array is not empty
            if (mIds.length > 0) {
                const mentors = await User.find({ _id: { $in: mIds }, role: 'mentor' });
                if (mentors.length !== mIds.length) {
                    return res.status(400).json({ message: 'One or more invalid mentor IDs provided' });
                }
            }
            user.mentorId = mIds;
        }

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            mentorId: user.mentorId,
            devoteeType: user.devoteeType
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all mentors (for devotee registration)
// @route   GET /api/auth/mentors
// @access  Public
export const getMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor', isActive: true })
            .select('name email')
            .sort({ name: 1 });

        res.json(mentors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
