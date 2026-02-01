import express from 'express'
import { allUser, changePassword, forgotPassword, getUserById, login, logout, register, reverify, verify, verifyOtp } from '../Controller/userController.js'
import { verifyEmail } from '../emailVerify/verifyEmail.js'
import { isAdmin, isAuthenticated } from '../middleware/isAuthenticated.js'



const router = express.Router()

router.post('/register',register)
router.post('/verify',verify)
router.post('/reVerify',reverify)
router.post('/login', login)
router.post('/logout',isAuthenticated,logout)
router.post('/forgot-password', forgotPassword)
router.post('/change-password/:email', changePassword)
router.post('/verify-otp/:email', verifyOtp)
router.get('/all-user',isAuthenticated, isAdmin, allUser)
router.get('/get-user/:userId',getUserById)

export default router;