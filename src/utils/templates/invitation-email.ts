export const invitationEmailTemplate = (
  inviterName: string,
  workspaceName: string,
  inviteLink: string,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workspace Invitation - Gravity</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:40px;color:#ffffff;">

              <div style="font-size:48px;margin-bottom:10px;">🚀</div>

              <h1 style="margin:0;font-size:32px;font-weight:bold;">
                Gravity
              </h1>

              <p style="margin:10px 0 0;font-size:16px;opacity:0.95;">
                Project & Task Management Platform
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">

              <h2 style="margin:0;color:#111827;font-size:26px;">
                You're Invited! 🎉
              </h2>

              <p style="margin-top:25px;font-size:16px;line-height:28px;color:#4b5563;">
                <strong>${inviterName}</strong> has invited you to join
                <strong>${workspaceName}</strong> on Gravity.
              </p>

              <p style="font-size:16px;line-height:28px;color:#4b5563;">
                Collaborate with your team, manage projects, track tasks,
                and get things done together.
              </p>

              <!-- Workspace Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="margin:30px 0;background:#eff6ff;border:1px solid #dbeafe;border-radius:12px;">

                <tr>
                  <td style="padding:25px;text-align:center;">

                    <div style="font-size:36px;margin-bottom:10px;">
                      🏢
                    </div>

                    <p style="margin:0;font-size:14px;color:#6b7280;">
                      You've been invited to join
                    </p>

                    <h3 style="margin:8px 0 0;font-size:22px;color:#1e3a8a;">
                      ${workspaceName}
                    </h3>

                  </td>
                </tr>

              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="margin:35px 0;">

                <tr>
                  <td align="center">

                    <a href="${inviteLink}"
                      style="display:inline-block;padding:15px 32px;background:#4f46e5;color:#ffffff;
                      text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">
                      Accept Invitation
                    </a>

                  </td>
                </tr>

              </table>

              <!-- Fallback Link -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:18px;border-radius:8px;">

                <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">
                  If the button doesn't work, copy and paste the following link into your browser:
                </p>

                <p style="margin:0;font-size:13px;line-height:22px;word-break:break-all;">
                  <a href="${inviteLink}" style="color:#2563eb;text-decoration:none;">
                    ${inviteLink}
                  </a>
                </p>

              </div>

              <!-- Security Notice -->
              <div style="background:#fff7ed;border-left:5px solid #f59e0b;padding:18px;border-radius:8px;
                color:#92400e;font-size:15px;line-height:24px;margin-top:25px;">

                ⏳ <strong>Invitation Link</strong>
                <br>
                Please accept this invitation using the link provided above.
                If you were not expecting this invitation, you can safely ignore this email.

              </div>

              <p style="margin-top:30px;font-size:15px;line-height:26px;color:#6b7280;">
                If you have any questions about this invitation, please contact
                <strong>${inviterName}</strong>.
              </p>

              <p style="margin-top:35px;font-size:16px;color:#111827;">
                Best Regards,
                <br />
                <strong>Gravity Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:30px;background:#f9fafb;border-top:1px solid #e5e7eb;">

              <p style="margin:0;font-size:15px;color:#4b5563;font-weight:bold;">
                Gravity
              </p>

              <p style="margin:10px 0 0;font-size:13px;color:#6b7280;">
                Plan • Collaborate • Track • Deliver
              </p>

              <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Gravity. All rights reserved.
              </p>

              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
                This is an automated email from Gravity. Please do not reply to this message.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
