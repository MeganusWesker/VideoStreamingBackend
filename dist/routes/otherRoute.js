import { Router } from "express";
const router = Router();
import { getDashboardStats } from "../controller/otherController.js";
import { isAdmin, isAuthenticatedUser } from "../middlewares/userAuth.js";
router.route('/admin/getstats').get(isAuthenticatedUser, isAdmin, getDashboardStats);
export default router;
