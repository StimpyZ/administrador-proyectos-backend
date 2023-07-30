import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()
app.use(express.json())

dotenv.config()

connectDB()

const whitelist = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

app.use(cors(corsOptions))

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    socket.on('abrir-proyecto', (proyecto) => {
        socket.join(proyecto)
    })

    socket.on('nueva-tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea-agregada', tarea)
    })

    socket.on('eliminar-tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea-eliminada', tarea)
    })

    socket.on('editar-tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea-editada', tarea)
    })

    socket.on('completar-tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea-completada', tarea)
    })
})
