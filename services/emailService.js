/**
 * Email Service
 * Handles email notifications for user approval
 */

import nodemailer from 'nodemailer';

// Create transporter (configured lazily)
let transporter = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
    if (transporter) return transporter;

    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

    // If email not configured, return null (will log instead of send)
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
        console.log('⚠️ Email not configured. Emails will be logged to console.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    return transporter;
}

/**
 * Send approval notification email
 * @param {string} userEmail - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Send result
 */
export async function sendApprovalEmail(userEmail, userName) {
    try {
        const transport = getTransporter();
        const fromAddress = process.env.EMAIL_FROM || 'OpenLearn Hub <noreply@openlearnhub.com>';

        const emailContent = {
            from: fromAddress,
            to: userEmail,
            subject: '✅ Your OpenLearn Hub Account Has Been Verified!',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: #2563eb; border-radius: 16px; color: white; font-weight: bold; font-size: 28px;">O</div>
                    </div>
                    
                    <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Welcome to OpenLearn Hub!</h1>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName || 'there'}</strong>,
                    </p>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Great news! Your account has been verified by our admin team. You can now sign in and start exploring all the features of OpenLearn Hub.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/login" 
                           style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                            Sign In Now
                        </a>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Thank you for joining our community of learners and educators!
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                        This is an automated message from OpenLearn Hub. Please do not reply to this email.
                    </p>
                </div>
            `,
            text: `
Hi ${userName || 'there'},

Great news! Your OpenLearn Hub account has been verified.

You can now sign in and start exploring all the features of OpenLearn Hub.

Sign in at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/login

Thank you for joining our community of learners and educators!

- OpenLearn Hub Team
            `
        };

        // If no transporter, log to console instead
        if (!transport) {
            console.log('📧 [EMAIL SIMULATION]');
            console.log('To:', userEmail);
            console.log('Subject:', emailContent.subject);
            console.log('Message: Your account has been verified. You can now sign in.');
            return { success: true, simulated: true };
        }

        // Send actual email
        const result = await transport.sendMail(emailContent);
        console.log(`✅ Approval email sent to: ${userEmail}`);

        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Failed to send approval email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>} True if email is configured correctly
 */
export async function verifyEmailConfig() {
    try {
        const transport = getTransporter();
        if (!transport) {
            return { configured: false, message: 'Email not configured' };
        }

        await transport.verify();
        return { configured: true, message: 'Email configured correctly' };
    } catch (error) {
        return { configured: false, message: error.message };
    }
}
