import express from "express"
import { 
    addCourseSection,
    addCourse,
    addModule,
    addUnit,
    getAllCourseSections, 
    getAllCourses, 
    getAllModules, 
    getAllUnits,
    editCourseSection,
    editCourse,
    editModule,
    editUnit,
    archiveCourseSection,
    archiveCourse,
    archiveModule,
    archiveUnit,
    uploadImage
 } from "../controllers/adminContentManagement.js"


const router = express.Router()

import { verifyAdminToken } from "../verifyAdminToken.js"

// CREATE
router.post("/addCourseSection", verifyAdminToken, addCourseSection)
router.post("/addCourse", verifyAdminToken, addCourse)
router.post("/addModule", verifyAdminToken, addModule)
router.post("/addUnit", verifyAdminToken, addUnit)

// RETRIEVE
router.get("/getAllCourseSections", verifyAdminToken, getAllCourseSections)
router.get("/getAllCourses", verifyAdminToken, getAllCourses)
router.get("/getAllModules", verifyAdminToken, getAllModules)
router.get("/getAllUnits", verifyAdminToken, getAllUnits)
router.get("/uploadImage", verifyAdminToken, uploadImage)

// UPDATE
router.put('/editCourseSection/:id', verifyAdminToken, editCourseSection);
router.put('/editCourse/:id', verifyAdminToken, editCourse);
router.put('/editModule/:id', verifyAdminToken, editModule);
router.put('/editUnit/:id', verifyAdminToken, editUnit);

// DELETE
router.put('/archiveCourseSection/:id', verifyAdminToken, archiveCourseSection);
router.put('/archiveCourse/:id', verifyAdminToken, archiveCourse);
router.put('/archiveModule/:id', verifyAdminToken, archiveModule);
router.put('/archiveUnit/:id', verifyAdminToken, archiveUnit);


export default router;