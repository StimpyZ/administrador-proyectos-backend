import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: `${process.env.USER_HOST}`,
        port: process.env.USER_PORT,
        auth: {
            user: `${process.env.USER_EMAIL}`,
            pass: `${process.env.USER_PASSWORD}`
        }
    })

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos"<cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Confirma tu cuenta',
        text: `Hola ${nombre}, confirma tu cuenta`,
        html: `
            <h1>Confirma tu cuenta</h1>
            <p>Hola ${nombre}, confirma tu cuenta</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>
            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    })
}

export const emailOlvidePassword = async (datos) => {
    const { nombre, email, token } = datos

    const transport = nodemailer.createTransport({
        host: `${process.env.USER_HOST}`,
        port: process.env.USER_PORT,
        auth: {
            user: `${process.env.USER_EMAIL}`,
            pass: `${process.env.USER_PASSWORD}`
        }
    })

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos"<cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Reestablece tu contraseña',
        text: `Hola ${nombre}, Reestablece tu contraseña`,
        html: `
            <h1>Reestablece tu contraseña</h1>
            <p>Hola ${nombre}, Reestablece tu contraseña</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a>
            <p>Si tu no solicitaste este email, puedes ignorar este mensaje</p>
        `
    })
}
