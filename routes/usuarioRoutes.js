import express from 'express'
import { autenticar, comprobarToken, confimar, nuevoPassword, olvidePassword, perfil, registrar } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'
const router = express.Router()

router.post('/', registrar)
router.post('/login', autenticar)
router.get('/confirmar/:token', confimar)
router.post('/olvide-password', olvidePassword)

router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)
router.get('/perfil', checkAuth, perfil)


export default router