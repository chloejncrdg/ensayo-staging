import express from "express"
import { 
    addToolGroup,
    addPracticalGroup,
    addTool,
    uploadObject,
    getAllToolGroups,
    getAllPracticalGroups,
    getAllTools,
    editToolGroup,
    editPracticalGroup,
    editTool,
    archiveToolGroup,
    archivePracticalGroup,
    archiveTool
} from "../controllers/adminLessonManagement.js"

import { verifyAdminToken } from "../verifyAdminToken.js"

const router = express.Router()


// CREATE
router.post("/addToolGroup", verifyAdminToken, addToolGroup)
router.post("/addPracticalGroup", verifyAdminToken, addPracticalGroup)
router.post("/addTool", verifyAdminToken, addTool)

// RETRIEVE
router.get("/uploadObject", verifyAdminToken, uploadObject)
router.get("/getAllToolGroups", verifyAdminToken, getAllToolGroups)
router.get("/getAllPracticalGroups", verifyAdminToken, getAllPracticalGroups)
router.get("/getAllTools", verifyAdminToken, getAllTools)

// UPDATE
router.put("/editToolGroup/:id", verifyAdminToken, editToolGroup)
router.put("/editPracticalGroup/:id", verifyAdminToken, editPracticalGroup)
router.put("/editTool/:id", verifyAdminToken, editTool)

// DELETE (ARCHIVE)
router.put("/archiveToolGroup/:id", verifyAdminToken, archiveToolGroup)
router.put("/archivePracticalGroup/:id", verifyAdminToken, archivePracticalGroup)
router.put("/archiveTool/:id", verifyAdminToken, archiveTool)



export default router;