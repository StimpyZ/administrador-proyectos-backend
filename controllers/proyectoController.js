import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tareas.js'
import Usuario from '../models/Usuario.js'
import mongoose from 'mongoose'

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: { $in: req.usuario } },
            { creador: { $in: req.usuario._id } }
        ]
    })

    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Hubo un error' })
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('El proyecto no existe')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id).populate(
        'colaboradores',
        'nombre email'
    )

    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (
        proyecto.creador.toString() !== req.usuario._id.toString() &&
        !proyecto.colaboradores.some(
            (colaborador) =>
                colaborador._id.toString() === req.usuario._id.toString()
        )
    ) {
        const error = new Error('No autorizado')
        return res.status(401).json({ msg: error.message })
    }
    try {
        const tareas = await Tarea.find({ proyecto: proyecto._id }).populate('completado', 'nombre')
        const proyectoConTareas = { ...proyecto._doc, tareas }

        res.json(proyectoConTareas)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error interno del servidor' })
    }
}

const editarProyecto = async (req, res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No autorizado')
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {}
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params

    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No autorizado')
        return res.status(401).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne()
        res.json({ msg: 'Proyecto eliminado correctamente' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Hubo un error' })
    }
}

const buscarColaborador = async (req, res) => {
    const { email } = req.body

    const usuario = await Usuario.findOne({ email }).select(
        '-password -__v -password -token -updatedAt -createdAt'
    )

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No autorizado')
        return res.status(401).json({ msg: error.message })
    }

    const { email } = req.body

    const usuario = await Usuario.findOne({ email }).select(
        '-password -__v -password -token -updatedAt -createdAt'
    )

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('No puedes agregarte a ti mismo')
        return res.status(401).json({ msg: error.message })
    }

    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya es colaborador')
        return res.status(401).json({ msg: error.message })
    }

    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: 'Colaborador agregado correctamente' })
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({ msg: error.message })
    }
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: 'Colaborador Eliminado Correctamente' })
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
}
