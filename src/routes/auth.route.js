import express from 'express';
import { login, register, sendOTP, verifyOTP } from '../controllers/auth.controller.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/sendotp', sendOTP)
router.post('/verifyotp', verifyOTP)
router.post('/register', register)
router.post('/login', login)

export default router;