import  { Router }  from "express";

const router:Router =Router();

import { isAuthenticatedUser } from "../middlewares/userAuth.js";


// import {getSubscription,paymentVerification,getApiKey} from "../controllers/paymentController.js";

// router.route('/subscribe').get(isAuthenticatedUser,getSubscription);

// router.route('/razorpaykey').get(getApiKey);

// router.route('/paymentverification').post(isAuthenticatedUser,paymentVerification);

export default router;