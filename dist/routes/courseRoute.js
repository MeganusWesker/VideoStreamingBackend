import { Router } from "express";
const router = Router();
import { isAuthenticatedUser, isAdmin, isAutorizedUser } from "../middlewares/userAuth.js";
import singleUpload from "../middlewares/multer.js";
// importing all functions 
import { createCourse, getAllCourses, getCourseLectures, addLectures, deleteCourse, deleteLecture } from "../controller/courseController.js";
router.route('/createcourse').post(singleUpload, isAuthenticatedUser, isAdmin, createCourse);
router.route('/courses')
    .get(getAllCourses);
router.route('/course/:id')
    .post(isAuthenticatedUser, isAdmin, singleUpload, addLectures)
    .delete(isAuthenticatedUser, isAdmin, deleteCourse);
router.route('/getcourselectures/:id').get(isAuthenticatedUser, isAutorizedUser, getCourseLectures);
router.route('/deletelecture').delete(isAuthenticatedUser, isAdmin, deleteLecture);
export default router;
