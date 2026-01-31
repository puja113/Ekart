import express from 'express'
import { login, logout, register, reverify, verify } from '../Controller/userController.js'
import { verifyEmail } from '../emailVerify/verifyEmail.js'
import { isAuthenticated } from '../middleware/isAuthenticated.js'



const router = express.Router()

router.post('/register',register)
router.post('/verify',verify)
router.post('/reVerify',reverify)
router.post('/login', login)
router.post('/logout',isAuthenticated,logout)

export default router;