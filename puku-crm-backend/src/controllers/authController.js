const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logActivity } = require('../utils/logger');
const { sendEmail } = require('../utils/mailer');

const register = async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;

        // Check if user exists
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const userId = await User.create({ name, email, password, role_id });

        // Use a mock req for logActivity if req.user is not yet available (it won't be for register)
        // Actually logActivity checks req.user, but for registration we can pass user_id manually or update logActivity
        // Let's modify logActivity to accept an optional explicit userId
        await logActivity({ user: { id: userId } }, 'REGISTERED', 'User', userId, { name, email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { userId }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await User.verifyPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        await User.updateLastLogin(user.id);
        await logActivity({ user: { id: user.id } }, 'LOGIN', 'User', user.id);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_name: user.role_name,
                permissions: user.permissions
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        await User.updateProfile(req.user.id, { name, email, password });
        await logActivity(req, 'UPDATED', 'User', req.user.id, { name, email });
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await User.setResetToken(email, resetToken, resetExpires);

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        const emailSent = await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            html: message
        });

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }

        await logActivity({ user: { id: user.id } }, 'FORGOT_PASSWORD_REQUEST', 'User', user.id);

        res.json({ success: true, message: 'Email sent with reset instructions' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findByResetToken(token);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        await User.updatePassword(user.id, password);
        await logActivity({ user: { id: user.id } }, 'PASSWORD_RESET_SUCCESS', 'User', user.id);

        res.json({ success: true, message: 'Password reset successful. You can now login.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };
