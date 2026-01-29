import express from 'express'
import { register, reverify, verify } from '../Controller/userController.js'
import { verifyEmail } from '../emailVerify/verifyEmail.js'


const router = express.Router()

router.post('/register',register)
router.post('/verify',verify)
router.post('/reVerify',reverify)

export default router;