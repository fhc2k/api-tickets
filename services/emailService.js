const transporter = require("../config/mailer");
const { formatDateToMX } = require("../utils/formatDate"); 

const sendWelcomeEmail = async ({ email, name, role, createdAt }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; color: #333;">
            <h2 style="color: #2b4c7e;">Registro de cuenta exitoso</h2>
            <p>Hola, <strong>${name}</strong> 👋</p>
            <p>Estamos verificando el reciente registro de tu cuenta con rol <strong>${role}</strong> en nuestro sistema de soporte.</p>

            <h4>Detalles del registro:</h4>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Fecha y hora:</strong> ${formatDateToMX(createdAt)}</li>
            </ul>

            <p style="margin-top: 1em;">
                Tu cuenta ha sido registrada correctamente, pero aún no está activa. Un administrador revisará tu información y la activará en breve.
            </p>

            <hr/>
            <p style="font-size: 0.85em; color: #999;">Este correo fue enviado automáticamente. No respondas a este mensaje.</p>
        </div>
    `;

    transporter.sendMail({
        from: '"Departamento de Informática y Soporte" <no-reply@soporte.com>',
        to: email,
        subject: `Registro recibido – Cuenta en revisión`,
        html,
    });
};

const sendStatusChangeEmail = async ({ email, name, status, createdAt }) => {
    const isActivated = status === "active";
    const statusText = isActivated
        ? "Activación de cuenta"
        : "Suspensión de cuenta";
    const actionMsg = isActivated
        ? "Tu cuenta ha sido activada y ya puedes acceder al sistema de soporte."
        : "Tu cuenta ha sido suspendida. No podrás acceder hasta que un administrador la reactive.";

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; color: #333;">
            <h2 style="color: #2b4c7e;">Estado de cuenta actualizado</h2>
            <p>Hola, <strong>${name}</strong> 👋</p>
            <p>${actionMsg}</p>
            <h4>Detalles del evento:</h4>
            <ul style="list-style: none; padding: 0;">
                <li><strong>Estado actual:</strong> ${status}</li>
                <li><strong>Fecha y hora:</strong> ${formatDateToMX(createdAt)}</li>
            </ul>
            <hr/>
            <p style="font-size: 0.85em; color: #999;">Este correo fue enviado automáticamente. No respondas a este mensaje.</p>
        </div>
    `;

    transporter.sendMail({
        from: '"Departamento Informatica y Soporte" <no-reply@soporte.com>',
        to: email,
        subject: `${statusText} – ${status.toUpperCase()}`,
        html,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendStatusChangeEmail,
};
