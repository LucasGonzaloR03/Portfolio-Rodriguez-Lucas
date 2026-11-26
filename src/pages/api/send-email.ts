import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, subject, message } = data;

    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ message: "Todos los campos son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: "Email inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", 
      to: import.meta.env.MY_EMAIL || "tu@email.com", 
      replyTo: email,
      subject: `Nuevo mensaje: ${subject}`,
      html: `
        <div style="background:#f4f4f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
            <div style="background:#facc15;padding:20px 24px;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:#18181b;">Nuevo mensaje desde tu portafolio</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#3f3f46;">Lucas Gonzalo Rodriguez &middot; UNSAM</p>
            </div>
            <div style="padding:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;color:#71717a;width:140px;vertical-align:top;">Email del visitante</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f4f4f5;color:#18181b;word-break:break-word;">${escapeHtml(email)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#71717a;vertical-align:top;">Asunto</td>
                  <td style="padding:8px 0;color:#18181b;word-break:break-word;">${escapeHtml(subject)}</td>
                </tr>
              </table>
              <p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Mensaje</p>
              <div style="background:#fafafa;border:1px solid #e4e4e7;border-left:4px solid #facc15;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#27272a;">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
            </div>
            <div style="background:#fafafa;border-top:1px solid #e4e4e7;padding:16px 24px;font-size:12px;color:#71717a;">
              Respondé directamente a este correo para contactar al visitante.
            </div>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("Error de Resend:", result.error);
      return new Response(
        JSON.stringify({ message: "Error al enviar el email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Email enviado con éxito" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al procesar el email:", error);
    return new Response(
      JSON.stringify({ message: "Error al enviar el email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
