import express from "express";
import { adminRegister,adminLogin } from "../controllers/admin.js";
import {rateLimit} from '../middleware/rateLimiter.js'
const router = express.Router()
router.post('/register',rateLimit,adminRegister)
router.post('/login',rateLimit,adminLogin)
export default router