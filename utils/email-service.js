const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Email service utility for Speed Up project
class EmailService {
    constructor() {
        // Configure your email transporter (example with Gmail)
        this.transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASSWORD // Your app password
            }
        });
    }

    async sendTemplateEmail(options) {
        try {
            // Render the EJS template with dynamic data
            const templatePath = path.join(__dirname, '../templates/email-template.ejs');
            const html = await ejs.renderFile(templatePath, options.templateData || {});

            // Email options
            const mailOptions = {
                from: `"Speed Up" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject || 'Speed Up Notification',
                html: html
            };

            // Send email
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Send welcome email to new user
    async sendWelcomeEmail(userEmail, userName) {
        const templateData = {
            title: 'Welcome to Speed Up!',
            greeting: userName,
            message: 'Welcome aboard! We\'re thrilled to have you join the Speed Up community. Your account has been successfully created and you\'re ready to accelerate your success.',
            buttonText: 'Get Started',
            buttonUrl: `${process.env.FRONTEND_URL}/dashboard`,
            additionalInfo: 'If you have any questions, feel free to reach out to our support team.'
        };

        return this.sendTemplateEmail({
            to: userEmail,
            subject: 'Welcome to Speed Up! 🚀',
            templateData
        });
    }

    // Send password reset email
    async sendPasswordResetEmail(userEmail, userName, resetToken) {
        const templateData = {
            title: 'Password Reset Request',
            greeting: userName,
            message: 'We received a request to reset your password. Click the button below to create a new password. This link will expire in 24 hours for security reasons.',
            buttonText: 'Change Password',
            buttonUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
            additionalInfo: 'If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.'
        };

        return this.sendTemplateEmail({
            to: userEmail,
            subject: 'Reset Your Speed Up Password',
            templateData
        });
    }

    // Send account verification email
    async sendVerificationEmail(userEmail, userName, verificationToken) {
        const templateData = {
            title: 'Verify Your Account',
            greeting: userName,
            message: 'Thanks for signing up with Speed Up! Please verify your email address to activate your account and start exploring all our amazing features.',
            buttonText: 'Verify Email',
            buttonUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
            additionalInfo: 'This verification link will expire in 48 hours. If you didn\'t create an account with Speed Up, please ignore this email.'
        };

        return this.sendTemplateEmail({
            to: userEmail,
            subject: 'Verify Your Speed Up Account',
            templateData
        });
    }

    // Send notification email
    async sendNotificationEmail(userEmail, userName, notificationData) {
        const templateData = {
            title: notificationData.title || 'Speed Up Notification',
            greeting: userName,
            message: notificationData.message,
            buttonText: notificationData.buttonText || 'View Details',
            buttonUrl: notificationData.buttonUrl || `${process.env.FRONTEND_URL}/dashboard`,
            additionalInfo: notificationData.additionalInfo || null
        };

        return this.sendTemplateEmail({
            to: userEmail,
            subject: notificationData.subject || 'Speed Up Notification',
            templateData
        });
    }

    // send schedule demo email
    async sendScheduleDemoEmail(data){
        const demoData = {
            title: "New Demo Request Received",
            message: "A new demo request has been submitted by the user. Please check the details below:",
            buttonText: "View Request",
            buttonUrl: `${process.env.FRONTEND_URL}/admin/demo-requests`, 
            additionalInfo: {
              userName: `${data.userName}`,       
              userPhone: `${data.userPhone}`,       
              requestedDate: `${data.date}`,       
              requestedTime: `${data.time}`,           
              submittedAt: new Date().toISOString() 
            }
          };

          return this.sendTemplateEmail({
            to:process.env.EMAIL_USER,
            subject:"Speed up demo request",
            demoData
          })
    }
}

module.exports = new EmailService();