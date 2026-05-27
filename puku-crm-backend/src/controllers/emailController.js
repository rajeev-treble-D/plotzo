const { sendEmail } = require('../utils/mailer');
const { logActivity } = require('../utils/logger');

exports.sendCustomEmail = async (req, res) => {
    try {
        const { to, subject, message, customerId } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const emailSent = await sendEmail({
            to,
            subject,
            html: message.replace(/\n/g, '<br>')
        });

        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send email. Check your SMTP settings.' });
        }

        // Log activity if customerId is provided
        if (customerId) {
            await logActivity(req, 'SENT_EMAIL', 'Customer', customerId, { subject });
        } else {
            await logActivity(req, 'SENT_EMAIL', 'Direct', null, { to, subject });
        }

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
        console.error('Error sending custom email:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
