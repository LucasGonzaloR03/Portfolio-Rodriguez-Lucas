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
        <div style="background:#ffffff;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2328;">
          <div style="max-width:600px;margin:0 auto;border:1px solid #d0d7de;border-radius:8px;overflow:hidden;">
            <div style="padding:16px 20px;border-bottom:1px solid #d0d7de;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#656d76;">Portafolio &middot; Contacto</p>
              <h1 style="margin:0;font-size:16px;font-weight:600;line-height:1.4;color:#1f2328;">Nuevo mensaje</h1>
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:10px 20px;border-bottom:1px solid #d8dee4;font-size:12px;color:#656d76;width:130px;vertical-align:top;">De</td>
                <td style="padding:10px 20px;border-bottom:1px solid #d8dee4;font-size:13px;color:#1f2328;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;word-break:break-word;">${escapeHtml(email)}</td>
              </tr>
              <tr>
                <td style="padding:10px 20px;font-size:12px;color:#656d76;vertical-align:top;">Asunto</td>
                <td style="padding:10px 20px;font-size:13px;color:#1f2328;word-break:break-word;">${escapeHtml(subject)}</td>
              </tr>
            </table>
            <p style="margin:20px 20px 8px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#656d76;">Mensaje</p>
            <div style="margin:0 20px 20px;background:#f6f8fa;border:1px solid #d0d7de;border-radius:6px;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace;font-size:13px;line-height:1.6;color:#1f2328;">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
            <div style="padding:12px 20px;border-top:1px solid #d0d7de;font-size:11px;color:#656d76;">
              Enviado desde el formulario de contacto. Respondé este correo para contestar al visitante.
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
