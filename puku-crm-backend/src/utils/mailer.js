const nodemailer = require('nodemailer');
const pool = require('../config/db');

const getSMTPSettings = async () => {
    const [rows] = await pool.query('SELECT key_name, key_value FROM settings WHERE key_name IN ("smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name")');
    const settings = {};
    rows.forEach(row => {
        settings[row.key_name] = row.key_value;
    });
    return settings;
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const settings = await getSMTPSettings();

        if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
            console.error('SMTP settings not fully configured');
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: parseInt(settings.smtp_port) || 587,
            secure: settings.smtp_port == 465, // true for 465, false for other ports
            auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass,
            },
        });

        const info = await transporter.sendMail({
            from: `"${settings.smtp_from_name || 'Puku CRM'}" <${settings.smtp_from_email || settings.smtp_user}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail };
