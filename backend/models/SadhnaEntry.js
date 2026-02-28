import mongoose from 'mongoose';

const BOOK_NAMES = [
    'Bhagavad-gītā As It Is',
    'Śrīmad-Bhāgavatam',
    'Śrī Caitanya-caritāmṛta',
    'Nectar of Instruction',
    'Kṛṣṇa, the Supreme Personality of Godhead',
    'The Nectar of Devotion',
    'Śrī Īśopaniṣad',
    'The Science of Self-Realization',
    'Beyond Birth and Death',
    'Bhakti: The Art of Eternal Love',
    'Śrī Brahma-saṁhitā',
    'Civilization and Transcendence',
    'The Journey of Self-Discovery',
    'On the Way to Kṛṣṇa',
    'The Path of Perfection',
    'The Perfection of Yoga',
    'Perfect Questions, Perfect Answers',
    'Rāja-vidyā: The King of Knowledge',
    'A Second Chance',
    'Teachings of Lord Caitanya',
    'Teachings of Lord Kapila',
    'Teachings of Queen Kuntī',
    'Light of the Bhāgavata',
    'Chant and be happy',
    'Śrīla Prabhupāda-līlāmṛta',
    'Rāmāyaṇa',
    'Mahābhārata - Retold by Kṛṣṇa Dharma dasa',
    'Other'
];

const sadhnaEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        index: true
    },
    wakeUpTime: {
        type: String,
        required: [true, 'Wake up time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    },
    sleepTime: {
        type: String,
        required: [true, 'Sleep time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
    },
    roundsChanted: {
        type: Number,
        required: [true, 'Number of rounds is required'],
        min: [0, 'Rounds cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Rounds must be a whole number'
        }
    },
    bookName: {
        type: String,
        required: [true, 'Book name is required'],
        enum: {
            values: BOOK_NAMES,
            message: '{VALUE} is not a valid book name'
        },
        default: 'Śrīmad-Bhāgavatam'
    },
    readingDuration: {
        type: Number,
        required: [true, 'Reading duration is required'],
        min: [0, 'Reading duration cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 1440; // Max 24 hours in minutes
            },
            message: 'Reading duration must be between 0 and 1440 minutes'
        }
    },
    serviceDuration: {
        type: Number,
        required: [true, 'Service duration is required'],
        min: [0, 'Service duration cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 24; // Max 24 hours
            },
            message: 'Service duration must be between 0 and 24 hours'
        }
    },
    serviceType: {
        type: String,
        default: '',
        trim: true,
        maxlength: [100, 'Service type cannot exceed 100 characters']
    },
    hearingDuration: {
        type: Number,
        required: [true, 'Hearing duration is required'],
        min: [0, 'Hearing duration cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 24; // Max 24 hours
            },
            message: 'Hearing duration must be between 0 and 24 hours'
        }
    },
    // Student-only fields
    studyDuration: {
        type: Number,
        default: 0,
        min: [0, 'Study duration cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 24;
            },
            message: 'Study duration must be between 0 and 24 hours'
        }
    },
    studyTopic: {
        type: String,
        default: '',
        trim: true,
        maxlength: [200, 'Study topic cannot exceed 200 characters']
    },
    // Score calculation for weekly winner
    totalScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure one entry per user per day
sadhnaEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total score before saving
sadhnaEntrySchema.pre('save', function (next) {
    // Scoring algorithm
    this.totalScore =
        (this.roundsChanted * 10) +           // 10 points per round
        (this.readingDuration * 0.5) +        // 0.5 points per minute of reading
        (this.serviceDuration * 20) +         // 20 points per hour of service
        (this.hearingDuration * 15) +         // 15 points per hour of hearing
        (this.studyDuration * 10) +           // 10 points per hour of study (students)
        (this.wakeUpTime <= '04:00' ? 50 : 0); // Bonus 50 points for waking before 4 AM

    next();
});

const SadhnaEntry = mongoose.model('SadhnaEntry', sadhnaEntrySchema);

export default SadhnaEntry;
