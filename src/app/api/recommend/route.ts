import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content with improved styling
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: 'hello@saunders-simmons.co.uk',
      subject: 'New Roofer Recommendation',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #1d4ed8;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin-bottom: 20px;
              }
              .content {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 0 0 8px 8px;
                border: 1px solid #e2e8f0;
              }
              .field {
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e2e8f0;
              }
              .field:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
              }
              .label {
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 4px;
              }
              .value {
                color: #1f2937;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">New Roofer Recommendation</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Business Name</div>
                  <div class="value">${data.businessName || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">Contact Name</div>
                  <div class="value">${data.contactName || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">Phone Number</div>
                  <div class="value">${data.phone || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">Email Address</div>
                  <div class="value">${data.email || '-'}</div>
                </div>
                <div class="field">
                  <div class="label">Location/Coverage Areas</div>
                  <div class="value">${data.location || '-'}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send recommendation' },
      { status: 500 }
    );
  }
} 