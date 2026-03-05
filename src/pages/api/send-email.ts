import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

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
        <h2>Nuevo mensaje de tu portafolio</h2>
        <p><strong>Email del visitante:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
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
