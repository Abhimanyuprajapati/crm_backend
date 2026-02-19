import express from 'express';
import { googleLogin, login, register, sendOTP, verifyOTP } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sendotp', sendOTP)
router.post('/verifyotp', verifyOTP)
router.post('/register', register)
router.post('/login', login)

// here is the auth google and microsoft routes
router.post("/google", googleLogin);


export default router;