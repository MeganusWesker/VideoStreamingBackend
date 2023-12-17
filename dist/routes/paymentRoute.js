import { Router } from "express";
const router = Router();
import { isAuthenticatedUser } from "../middlewares/userAuth.js";
import { getSubscription, paymentVerification, getApiKey, cancelSubscription } from "../controller/paymentController.js";
router.route('/subscribe').get(isAuthenticatedUser, getSubscription);
router.route('/razorpaykey').get(getApiKey);
router.route('/paymentverification').post(isAuthenticatedUser, paymentVerification);
router.route('/cancelSubscription').delete(isAuthenticatedUser, cancelSubscription);
export default router;
