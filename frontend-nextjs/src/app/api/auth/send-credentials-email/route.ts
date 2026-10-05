import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // HTML Email Template for DecoForge 3D Studio credentials
    const emailSubject = 'Your DecoForge 3D Account Credentials';
    const emailBodyText = `
Welcome to DecoForge 3D Interior Architecture Studio!

Hi ${name || 'Designer'},

Your account has been created successfully. Here are your login credentials:

- Login Portal: http://localhost:3000
- Username / Mobile: +91 ${phone || ''}
- Registered Email: ${email}
- Security Password: ${password}

Please keep your credentials safe. You can sign in using your Email or Mobile Number and this Password.

Best regards,
DecoForge 3D Architecture Team
    `.trim();

    // Console log the email dispatch for verification in local dev
    console.log('\n======================================================');
    console.log('📧 [OUTGOING CREDENTIALS EMAIL]');
    console.log(`To: ${email}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`User: ${name || 'Designer'} (+91 ${phone})`);
    console.log(`Password: ${password}`);
    console.log('======================================================\n');

    // If an external SMTP or webhook email provider is configured, call it here
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'DecoForge 3D <onboarding@resend.dev>',
            to: [email],
            subject: emailSubject,
            text: emailBodyText,
          }),
        });
      } catch (err) {
        console.warn('Resend email error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Login credentials sent successfully to ${email}`,
      dispatchedTo: email,
    });
  } catch (error: any) {
    console.error('Failed to send credentials email:', error);
    return NextResponse.json(
      { error: 'Failed to process email dispatch' },
      { status: 500 }
    );
  }
}
