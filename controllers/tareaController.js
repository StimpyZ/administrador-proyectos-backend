import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tareas.js'

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body

    const existeProyecto = await Proyecto.findById(proyecto)

    if (!existeProyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ msg: error.message })
    }

    if (existeProyecto.creador.toString() !== req.usuario.id.toString()) {
        const error = new Error('No estas autorizado')
        return res.status(401).json({ msg: error.message })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Hubo un error' })
    }
}

const obtenerTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
        const error = new Error('No estas autorizado')
        return res.status(401).json({ msg: error.message })
    }

    res.json(tarea)
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
        const error = new Error('No estas autorizado')
        return res.status(401).json({ msg: error.message })
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaActualizada = await tarea.save()
        res.json(tareaActualizada)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Hubo un error' })
    }
}

const eliminarTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
        const error = new Error('No estas autorizado')
        return res.status(401).json({ msg: error.message })
    }

    try {
        await tarea.deleteOne()
        res.json({ msg: 'Tarea eliminada correctamente' })
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstadoTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if (!tarea) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ msg: error.message })
    }

    if (
        tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
        !tarea.proyecto.colaboradores.some(
            (colaborador) =>
                colaborador._id.toString() === req.usuario._id.toString()
        )
    ) {
        const error = new Error('Acción no válida')
        return res.status(403).json({ msg: error.message })
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id)
        .populate('proyecto')
        .populate('completado')

    res.json(tareaAlmacenada)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstadoTarea
}
