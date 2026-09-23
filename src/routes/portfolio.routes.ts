import { Router } from "express";
import { getCategories, getProjectBySlug, getProjects, getSkills } from "../controllers/project.controller";

const router = Router()

router.get('/projects', getProjects);
router.get('/projects/categories', getCategories)
router.get('/projects/:slug', getProjectBySlug)
router.get('/skills', getSkills);


export { router as portfolioRoutes }
