import { Router } from "express";
import { createProject, createSkill, deleteProject, deleteSkill, updateProject, updateSkill } from "../controllers/admin.controller";

const router = Router()

// Project Management Routes
router.post('/projects', createProject)
router.put('/projects/:id', updateProject)
router.delete('/projects/:id', deleteProject)

// Skill Management Routes

router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

export { router as adminRoutes }