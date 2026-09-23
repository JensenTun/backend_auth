import { NextFunction, Request, Response } from "express";
import { db } from "../config/firebase.config";
import { ProjectDocument, SkillDocument } from "../types/portfolio.types";

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, teach } = req.query;
        let query: FirebaseFirestore.Query = db.collection('projects');

        if (category && category !== 'all') {
            query = query.where('category', '==', (category as string).toLocaleLowerCase().trim());
        }

        query = query.orderBy('order', 'asc');
        const snapshot = await query.get();
        let projects: ProjectDocument[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as ProjectDocument)
        }));

        if (teach) {
            const searchTerm = (teach as string).toLocaleLowerCase();
            projects = projects.filter((p) => p.teachStack && p.teachStack.some((t) => t.toLocaleLowerCase().includes(searchTerm)));
        }
        res.status(200).json({
            status: "success",
            results: projects.length,
            data: { projects }
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const snapshot = await db.collection('projects').where('slug', '==', slug).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({
                status: "fail",
                message: "Project not found"
            });
        }
        const doc = snapshot.docs[0];
        const project: ProjectDocument = {
            id: doc.id,
            ...(doc.data() as ProjectDocument)
        };
        res.status(200).json({
            status: "success",
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const snapshot = await db.collection('projects').get();
        const categoriesSet = new Set<string>();
        snapshot.docs.forEach((doc) => {
            const data = doc.data() as ProjectDocument;
            if (data.category) {
                categoriesSet.add(data.category);
            }
        });
        res.status(200).json({
            status: "success",
            data: { categories: Array.from(categoriesSet) }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 💡 အသစ်ဖြည့်စွက်ရန်: Get All Skills Controller
// ==========================================
export const getSkills = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const snapshot = await db.collection('skills').get();
        const skills: SkillDocument[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as SkillDocument)
        }));

        res.status(200).json({
            status: "success",
            results: skills.length,
            data: { skills }
        });
    } catch (error) {
        next(error);
    }
};