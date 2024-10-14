import express from "express"
import { 
    countTotalUsers, 
    countUsersWithEnrolledCourses, 
    countUsersEnrolledInCourses, 
    getAllUsers,
    getUserDetails
 } from "../controllers/adminUserManagement.js"

import { verifyAdminToken } from "../verifyAdminToken.js"

const router = express.Router()

router.get("/countTotalUsers", verifyAdminToken, countTotalUsers)
router.get("/countEnrolledUsers", verifyAdminToken, countUsersWithEnrolledCourses)
router.get("/courseEnrollees", verifyAdminToken, countUsersEnrolledInCourses)
router.get("/getUsers", verifyAdminToken, getAllUsers)
router.get("/getUserDetails/:userId", verifyAdminToken, getUserDetails)

export default router;