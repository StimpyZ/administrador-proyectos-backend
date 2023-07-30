import moongose from 'mongoose'

const proyectoSchema = moongose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            required: true
        },

        descripcion: {
            type: String,
            trim: true,
            required: true
        },

        fechaEntrega: {
            type: Date,
            default: Date.now()
        },

        cliente: {
            type: String,
            trim: true,
            required: true
        },

        creador: {
            type: moongose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },

        colaboradores: [
            {
                type: moongose.Schema.Types.ObjectId,
                ref: 'Usuario'
            }
        ]
    },
    {
        timestamps: true
    }
)

const Proyecto = moongose.model('Proyecto', proyectoSchema)
export default Proyecto
