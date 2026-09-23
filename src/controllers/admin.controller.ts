import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config.js';
import { ProjectDocument, SkillDocument } from '../types/portfolio.types.js';

// ==========================================
// 1. PROJECT MANAGEMENT CONTROLLERS
// ==========================================

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectData: Omit<ProjectDocument, 'id'> = {
            ...req.body,
            category: req.body.category ? req.body.category.toLowerCase().trim() : 'uncategorized',
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('projects').add(projectData);

        res.status(201).json({
            status: 'success',
            data: { id: docRef.id, ...projectData },
        });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const updateData = { ...req.body };

        if (updateData.category) {
            updateData.category = updateData.category.toLowerCase().trim();
        }

        const docRef = db.collection('projects').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ status: 'fail', message: 'Project not found' });
        }

        await docRef.update(updateData);

        res.status(200).json({
            status: 'success',
            message: 'Project updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const docRef = db.collection('projects').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ status: 'fail', message: 'Project not found' });
        }

        await docRef.delete();

        res.status(200).json({
            status: 'success',
            message: 'Project deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2. SKILL MANAGEMENT CONTROLLERS
// ==========================================

export const createSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const skillData: Omit<SkillDocument, 'id'> = {
            ...req.body,
            category: req.body.category ? req.body.category.toLowerCase().trim() : 'general',
        };

        const docRef = await db.collection('skills').add(skillData);

        res.status(201).json({
            status: 'success',
            data: { id: docRef.id, ...skillData },
        });
    } catch (error) {
        next(error);
    }
};

export const updateSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const docRef = db.collection('skills').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ status: 'fail', message: 'Skill not found' });
        }

        await docRef.update(req.body);

        res.status(200).json({
            status: 'success',
            message: 'Skill updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const docRef = db.collection('skills').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ status: 'fail', message: 'Skill not found' });
        }

        await docRef.delete();

        res.status(200).json({
            status: 'success',
            message: 'Skill deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};