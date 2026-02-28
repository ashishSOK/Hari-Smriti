import SadhnaEntry from '../models/SadhnaEntry.js';
import User from '../models/User.js';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, format } from 'date-fns';

// @desc    Create or update sadhna entry
// @route   POST /api/sadhna
// @access  Private
export const createOrUpdateEntry = async (req, res) => {
    try {
        const {
            id,
            _id,
            date,
            wakeUpTime,
            sleepTime,
            roundsChanted,
            bookName,
            readingDuration,
            serviceDuration,
            serviceType,
            hearingDuration,
            studyDuration,
            studyTopic
        } = req.body;

        const entryId = id || _id;
        const entryDate = startOfDay(new Date(date));

        // Check if entry already exists by ID first, then fallback to user and date
        let entry;
        if (entryId) {
            entry = await SadhnaEntry.findOne({ _id: entryId, userId: req.user._id });
        }

        if (!entry) {
            entry = await SadhnaEntry.findOne({
                userId: req.user._id,
                date: entryDate
            });
        }

        if (entry) {
            // Update existing entry
            entry.wakeUpTime = wakeUpTime;
            entry.sleepTime = sleepTime;
            entry.roundsChanted = roundsChanted;
            entry.bookName = bookName;
            entry.readingDuration = readingDuration;
            entry.serviceDuration = serviceDuration;
            entry.serviceType = serviceType;
            entry.hearingDuration = hearingDuration;
            entry.studyDuration = studyDuration || 0;
            entry.studyTopic = studyTopic || '';

            await entry.save();

            res.json({ message: 'Sadhna entry updated successfully', entry });
        } else {
            // Create new entry
            entry = await SadhnaEntry.create({
                userId: req.user._id,
                date: entryDate,
                wakeUpTime,
                sleepTime,
                roundsChanted,
                bookName,
                readingDuration,
                serviceDuration,
                serviceType,
                hearingDuration,
                studyDuration: studyDuration || 0,
                studyTopic: studyTopic || ''
            });

            res.status(201).json({ message: 'Sadhna entry created successfully', entry });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's sadhna entries
// @route   GET /api/sadhna/my-entries
// @access  Private
export const getMyEntries = async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;

        let query = { userId: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const entries = await SadhnaEntry.find(query)
            .sort({ date: -1 })
            .limit(limit ? parseInt(limit) : 100);

        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all devotees' entries (for mentors)
// @route   GET /api/sadhna/devotees-entries
// @access  Private (Mentor only)
export const getDevoteesEntries = async (req, res) => {
    try {
        // Get all devotees under this mentor
        const devotees = await User.find({ mentorId: req.user._id });
        const devoteeIds = devotees.map(d => d._id);

        const { date } = req.query;
        let query = { userId: { $in: devoteeIds } };

        if (date) {
            const targetDate = startOfDay(new Date(date));
            query.date = targetDate;
        }

        const entries = await SadhnaEntry.find(query)
            .populate('userId', 'name email phone')
            .sort({ date: -1, totalScore: -1 });

        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get weekly winner
// @route   GET /api/sadhna/weekly-winner
// @access  Private (Mentor only)
export const getWeeklyWinner = async (req, res) => {
    try {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });     // Sunday

        // Get ALL devotees under this mentor (including those with 0 entries)
        const devotees = await User.find({ mentorId: req.user._id });
        const devoteeIds = devotees.map(d => d._id);

        // Get all entries for this week
        const entries = await SadhnaEntry.find({
            userId: { $in: devoteeIds },
            date: { $gte: weekStart, $lte: weekEnd }
        }).populate('userId', 'name email phone');

        // Build a map keyed by devotee id for quick lookup
        const entryMap = {};
        entries.forEach(entry => {
            const uid = entry.userId._id.toString();
            if (!entryMap[uid]) entryMap[uid] = { user: entry.userId, totalScore: 0, entries: [] };
            entryMap[uid].totalScore += entry.totalScore;
            entryMap[uid].entries.push(entry);
        });

        // Helper: sleep duration in hours from HH:MM strings
        const calcSleepHrs = (wakeUp, sleep) => {
            if (!wakeUp || !sleep) return null;
            const toMin = t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
            let diff = toMin(wakeUp) - toMin(sleep);
            if (diff < 0) diff += 24 * 60; // crossed midnight (e.g. slept 22:00, woke 05:00)
            return Math.round((diff / 60) * 10) / 10;
        };
        const TARGETS = { sleepHrs: 7, readingMin: 30, hearingHrs: 1, serviceHrs: 1 };

        // Include ALL devotees (even those with no entries this week)
        const rankings = devotees.map(devotee => {
            const uid = devotee._id.toString();
            const data = entryMap[uid] || { user: devotee, totalScore: 0, entries: [] };
            const daysSubmitted = data.entries.length;
            const avgScorePerDay = daysSubmitted > 0
                ? Math.round(data.totalScore / daysSubmitted)
                : 0;

            let avgStats = null;
            if (daysSubmitted > 0) {
                const totalSleep = data.entries.reduce((s, e) => {
                    const h = calcSleepHrs(e.wakeUpTime, e.sleepTime);
                    return h !== null ? s + h : s;
                }, 0);
                avgStats = {
                    avgSleepHrs: Math.round((totalSleep / daysSubmitted) * 10) / 10,
                    avgReadingMin: Math.round(data.entries.reduce((s, e) => s + (e.readingDuration || 0), 0) / daysSubmitted),
                    avgHearingHrs: Math.round((data.entries.reduce((s, e) => s + (e.hearingDuration || 0), 0) / daysSubmitted) * 10) / 10,
                    avgServiceHrs: Math.round((data.entries.reduce((s, e) => s + (e.serviceDuration || 0), 0) / daysSubmitted) * 10) / 10,
                };
            }

            return {
                user: data.user,
                totalScore: data.totalScore,
                entries: data.entries,
                daysSubmitted,
                avgScorePerDay,
                avgStats
            };
        }).sort((a, b) => b.totalScore - a.totalScore);

        res.json({
            weekStart,
            weekEnd,
            rankings,
            winner: rankings.length > 0 && rankings[0].totalScore > 0 ? rankings[0] : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete sadhna entry
// @route   DELETE /api/sadhna/:id
// @access  Private
export const deleteEntry = async (req, res) => {
    try {
        const entry = await SadhnaEntry.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Check if user owns this entry
        if (entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this entry' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get devotees who haven't submitted today
// @route   GET /api/sadhna/missing-submissions
// @access  Private (Mentor only)
export const getMissingSubmissions = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

        // Get all devotees under this mentor
        const devotees = await User.find({ mentorId: req.user._id, isActive: true });
        const devoteeIds = devotees.map(d => d._id);

        // Get all entries for target date
        const entries = await SadhnaEntry.find({
            userId: { $in: devoteeIds },
            date: targetDate
        });

        const submittedUserIds = entries.map(e => e.userId.toString());

        // Find devotees who haven't submitted
        const missingDevotees = devotees.filter(d =>
            !submittedUserIds.includes(d._id.toString())
        );

        res.json({
            date: targetDate,
            missingDevotees: missingDevotees.map(d => ({
                _id: d._id,
                name: d.name,
                email: d.email,
                phone: d.phone
            })),
            total: missingDevotees.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get weekly attendance for all devotees under a mentor
// @route   GET /api/sadhna/weekly-attendance
// @access  Private (Mentor only)
export const getWeeklyAttendance = async (req, res) => {
    try {
        const { weekStart: weekStartParam } = req.query;

        const baseDate = weekStartParam ? new Date(weekStartParam) : new Date();
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });     // Sunday

        // Build array of 7 days Mon–Sun
        const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        // Get all active devotees under this mentor
        const devotees = await User.find({ mentorId: req.user._id, isActive: true });

        // Get all entries for this week
        const entries = await SadhnaEntry.find({
            userId: { $in: devotees.map(d => d._id) },
            date: { $gte: weekStart, $lte: weekEnd }
        });

        // Build attendance map
        const attendance = devotees.map(devotee => {
            const devoteeEntries = entries.filter(
                e => e.userId.toString() === devotee._id.toString()
            );

            const dailyStatus = days.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const submitted = devoteeEntries.some(
                    e => format(new Date(e.date), 'yyyy-MM-dd') === dayStr
                );
                return { date: dayStr, submitted };
            });

            const daysSubmitted = dailyStatus.filter(d => d.submitted).length;
            const percentage = Math.round((daysSubmitted / 7) * 100);

            return {
                devotee: {
                    _id: devotee._id,
                    name: devotee.name,
                    phone: devotee.phone
                },
                dailyStatus,
                daysSubmitted,
                percentage
            };
        });

        res.json({
            weekStart,
            weekEnd,
            days: days.map(d => format(d, 'yyyy-MM-dd')),
            attendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get monthly attendance for all devotees under a mentor
// @route   GET /api/sadhna/monthly-attendance?year=2026&month=2
// @access  Private (Mentor only)
export const getMonthlyAttendance = async (req, res) => {
    try {
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) || (now.getMonth() + 1); // 1-based

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59); // last day of month
        const totalDays = monthEnd.getDate();

        // Build array of all days in the month
        const days = Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(year, month - 1, i + 1);
            return format(d, 'yyyy-MM-dd');
        });

        // Get all active devotees under this mentor
        const devotees = await User.find({ mentorId: req.user._id, isActive: true });

        // Get all entries for this month
        const entries = await SadhnaEntry.find({
            userId: { $in: devotees.map(d => d._id) },
            date: { $gte: monthStart, $lte: monthEnd }
        });

        // Build attendance map
        const attendance = devotees.map(devotee => {
            const devoteeEntries = entries.filter(
                e => e.userId.toString() === devotee._id.toString()
            );

            const dailyStatus = days.map(dayStr => {
                const submitted = devoteeEntries.some(
                    e => format(new Date(e.date), 'yyyy-MM-dd') === dayStr
                );
                return { date: dayStr, submitted };
            });

            const daysSubmitted = dailyStatus.filter(d => d.submitted).length;
            const percentage = Math.round((daysSubmitted / totalDays) * 100);

            return {
                devotee: {
                    _id: devotee._id,
                    name: devotee.name,
                    phone: devotee.phone
                },
                dailyStatus,
                daysSubmitted,
                totalDays,
                percentage
            };
        });

        res.json({
            year,
            month,
            totalDays,
            days,
            attendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get monthly winner / leaderboard
// @route   GET /api/sadhna/monthly-winner
// @access  Private (Mentor only)
export const getMonthlyWinner = async (req, res) => {
    try {
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) || (now.getMonth() + 1); // 1-based

        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);
        const totalDays = monthEnd.getDate();

        // All devotees under this mentor
        const devotees = await User.find({ mentorId: req.user._id });

        // All entries for this month
        const entries = await SadhnaEntry.find({
            userId: { $in: devotees.map(d => d._id) },
            date: { $gte: monthStart, $lte: monthEnd }
        }).populate('userId', 'name email phone');

        // Build entry map
        const entryMap = {};
        entries.forEach(entry => {
            const uid = entry.userId._id.toString();
            if (!entryMap[uid]) entryMap[uid] = { user: entry.userId, totalScore: 0, entries: [] };
            entryMap[uid].totalScore += entry.totalScore;
            entryMap[uid].entries.push(entry);
        });

        // Helper: sleep duration
        const calcSleepHrs = (wakeUp, sleep) => {
            if (!wakeUp || !sleep) return null;
            const toMin = t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
            let diff = toMin(wakeUp) - toMin(sleep);
            if (diff < 0) diff += 24 * 60;
            return Math.round((diff / 60) * 10) / 10;
        };

        const rankings = devotees.map(devotee => {
            const uid = devotee._id.toString();
            const data = entryMap[uid] || { user: devotee, totalScore: 0, entries: [] };
            const daysSubmitted = data.entries.length;
            const avgScorePerDay = daysSubmitted > 0
                ? Math.round(data.totalScore / daysSubmitted) : 0;

            let avgStats = null;
            if (daysSubmitted > 0) {
                const totalSleep = data.entries.reduce((s, e) => {
                    const h = calcSleepHrs(e.wakeUpTime, e.sleepTime);
                    return h !== null ? s + h : s;
                }, 0);
                avgStats = {
                    avgSleepHrs: Math.round((totalSleep / daysSubmitted) * 10) / 10,
                    avgReadingMin: Math.round(data.entries.reduce((s, e) => s + (e.readingDuration || 0), 0) / daysSubmitted),
                    avgHearingHrs: Math.round((data.entries.reduce((s, e) => s + (e.hearingDuration || 0), 0) / daysSubmitted) * 10) / 10,
                    avgServiceHrs: Math.round((data.entries.reduce((s, e) => s + (e.serviceDuration || 0), 0) / daysSubmitted) * 10) / 10,
                };
            }

            return {
                user: data.user,
                totalScore: data.totalScore,
                entries: data.entries,
                daysSubmitted,
                totalDays,
                avgScorePerDay,
                avgStats
            };
        }).sort((a, b) => b.totalScore - a.totalScore);

        res.json({
            year, month, totalDays,
            rankings,
            winner: rankings.length > 0 && rankings[0].totalScore > 0 ? rankings[0] : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Get all sadhna history for a specific devotee
// @route   GET /api/sadhna/devotee-history/:userId
// @access  Private (Mentor only)
export const getDevoteeHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const devotee = await User.findOne({ _id: userId, mentorId: req.user._id });
        if (!devotee) {
            return res.status(403).json({ message: 'Not authorized to view this devotee' });
        }
        const entries = await SadhnaEntry.find({ userId }).sort({ date: -1 }).limit(365);
        res.json({ devotee, entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get peer devotees' daily entries (devotees under the same mentor)
// @route   GET /api/sadhna/peer-entries
// @access  Private (Devotee only)
export const getPeerDevoteesEntries = async (req, res) => {
    try {
        const myMentorIds = req.user.mentorId || [];
        if (myMentorIds.length === 0) {
            return res.status(400).json({ message: 'No mentor assigned to this devotee' });
        }
        // Get all devotees who share at least one mentor with the requesting user
        const peers = await User.find({ mentorId: { $in: myMentorIds }, isActive: true });
        const peerIds = peers.map(p => p._id);

        const { date } = req.query;
        let query = { userId: { $in: peerIds } };

        if (date) {
            const targetDate = startOfDay(new Date(date));
            query.date = targetDate;
        }

        const entries = await SadhnaEntry.find(query)
            .populate('userId', 'name email phone')
            .sort({ date: -1, totalScore: -1 });

        res.json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get full sadhna history for a peer devotee (same mentor)
// @route   GET /api/sadhna/peer-history/:userId
// @access  Private (Devotee only)
export const getPeerDevoteeHistory = async (req, res) => {
    try {
        const myMentorIds = req.user.mentorId || [];
        if (myMentorIds.length === 0) {
            return res.status(400).json({ message: 'No mentor assigned to this devotee' });
        }
        const { userId } = req.params;
        // Validate that the target devotee shares at least one mentor
        const devotee = await User.findOne({ _id: userId, mentorId: { $in: myMentorIds } });
        if (!devotee) {
            return res.status(403).json({ message: 'Not authorized to view this devotee' });
        }
        const entries = await SadhnaEntry.find({ userId }).sort({ date: -1 }).limit(365);
        res.json({ devotee, entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get list of peer devotees (same mentor group)
// @route   GET /api/sadhna/peer-devotees
// @access  Private (Devotee only)
export const getPeerDevotees = async (req, res) => {
    try {
        const myMentorIds = req.user.mentorId || [];
        if (myMentorIds.length === 0) {
            return res.status(400).json({ message: 'No mentor assigned to this devotee' });
        }
        // Find all active devotees who share at least one mentor
        const peers = await User.find({ mentorId: { $in: myMentorIds }, isActive: true })
            .select('name email phone');
        res.json(peers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
