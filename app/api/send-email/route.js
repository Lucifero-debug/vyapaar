import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the JSON body

    const { toEmail, subject, htmlContent, pdfBase64 } = body;

    const response = await resend.emails.send({
      from: "Your Company <yourname@resend.dev>",
      to: toEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          content: pdfBase64, // The PDF file as a base64 string
          filename: "invoice.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
console.log("quit",response)
    return NextResponse.json({ message: "Email sent successfully", response });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
