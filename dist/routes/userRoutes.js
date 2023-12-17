import { Router } from "express";
import { register, verify, login, logout, changePassword, deleteMyProfile, deleteUser, getAllUsers, getMyProfile, updateProfile, addToPlayList, removeFromPlaylist, updateUser, forgotPassword, resetPassword, changePhoto } from "../controller/userController.js";
import { isAuthenticatedUser, isAdmin } from "../middlewares/userAuth.js";
import singleUpload from "../middlewares/multer.js";
const router = Router();
router.route("/register").post(singleUpload, register);
router.route("/forgot/password").post(forgotPassword);
router.route("/reset/password").put(resetPassword);
router.route("/verify").post(verify);
router.route("/admin/user").delete(isAuthenticatedUser, isAdmin, deleteUser);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticatedUser, logout);
router.route("/admin/users").get(isAuthenticatedUser, isAdmin, getAllUsers);
router.route("/addToPlaylist").post(isAuthenticatedUser, addToPlayList);
router.route("/removefromplaylist").delete(isAuthenticatedUser, removeFromPlaylist);
router.route("/changePassword").put(isAuthenticatedUser, changePassword);
router.route("/updateprofile").put(isAuthenticatedUser, updateProfile);
router.route("/updatePhoto").put(singleUpload, isAuthenticatedUser, changePhoto);
router.route("/me").get(isAuthenticatedUser, getMyProfile).delete(isAuthenticatedUser, deleteMyProfile);
router.route("/admin/updateUser/:id").get(isAuthenticatedUser, isAdmin, updateUser);
export default router;
