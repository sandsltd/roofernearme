import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface SearchResult {
  businessName: string;
  distance: number;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { searchTerm, postcode, results } = data;
    
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

    // Format results for email
    const resultsHtml = results.map((roofer: SearchResult) => `
      <div class="roofer">
        <strong>${roofer.businessName}</strong> - ${roofer.distance} miles away
      </div>
    `).join('');

    // Email content with improved styling
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: 'hello@saunders-simmons.co.uk',
      subject: 'New Search on Local Roofer Near Me',
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
              .roofer {
                margin-bottom: 8px;
                padding: 8px;
                background-color: #fff;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">New Search Notification</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Search Term</div>
                  <div class="value">${searchTerm}</div>
                </div>
                <div class="field">
                  <div class="label">Postcode</div>
                  <div class="value">${postcode || 'Not detected'}</div>
                </div>
                <div class="field">
                  <div class="label">Results Found</div>
                  <div class="value">${results.length}</div>
                </div>
                ${results.length > 0 ? `
                  <div class="field">
                    <div class="label">Nearest Roofers</div>
                    <div class="value">
                      ${resultsHtml}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending search notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
} 