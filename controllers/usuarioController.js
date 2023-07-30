import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generateId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailOlvidePassword, emailRegistro } from '../helpers/emails.js'

const registrar = async (req, res) => {
    const { email } = req.body
    const existeUsuario = await Usuario.findOne({ email })

    if (existeUsuario) {
        const error = new Error('El usuario ya existe')
        return res.status(404).json({ msg: error.message })
    }

    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({msg: 'Usuario registrado correctamente, revisa tu correo para confirmar tu cuenta'})
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req, res) => {
    const { email, password } = req.body

    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    if (!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({ msg: error.message })
    }

    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            usuario: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error('La contraseña es incorrecta')
        return res.status(403).json({ msg: error.message })
    }
}

const confimar = async (req, res) => {
    const { token } = req.params
    const usuariosConfirmar = await Usuario.findOne({ token })

    if (!usuariosConfirmar) {
        const error = new Error('Token no valido')
        return res.status(403).json({ msg: error.message })
    }

    try {
        usuariosConfirmar.confirmado = true
        usuariosConfirmar.token = ''
        await usuariosConfirmar.save()

        res.json({ msg: 'Usuario confirmado correctamente' })
    } catch (error) {
        console.log(error)
    }
}

const olvidePassword = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email })

    if (!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    try {
        usuario.token = generarId()
        await usuario.save()

        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({
            msg: 'Se ha enviado un correo para restablecer tu contraseña'
        })
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params
    const tokenValido = await Usuario.findOne({ token })

    if (tokenValido) {
        res.json({ msg: 'Token valido' })
    } else {
        const error = new Error('Token no valido')
        return res.status(403).json({ msg: error.message })
    }
}

const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({ token })

    if (usuario) {
        usuario.password = password
        usuario.token = ''
        try {
            await usuario.save()
            res.json({ msg: 'Contraseña actualizada correctamente' })
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Token no valido')
        return res.status(403).json({ msg: error.message })
    }
}

const perfil = async (req, res) => {
    const { usuario } = req

    res.json(usuario)
}

export {
    registrar,
    autenticar,
    confimar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}
