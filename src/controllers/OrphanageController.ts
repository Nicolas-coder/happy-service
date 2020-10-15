import { Request, Response } from 'express'
import { getRepository } from 'typeorm';
import * as Yup from 'yup';
import Orphanage from '../models/orphanage';
import orphanageView from '../views/orphanages_view';

export default {
    // -===========================
    // - Create Orphanage
    // -===========================
    async create(req: Request, res: Response) {
        // Desestructure (don't know if this word exists hahaha) request body
        const {
            name, latitude, longitude, about, instructions, openingHours, openOnWeekends
        } = req.body;
        // Get table instance
        const OrphanagesRepository = getRepository(Orphanage);
        // Images treatment + map return image name
        const orphanageImages = req.files as Express.Multer.File[]
        const images = orphanageImages.map(image => {
            return { path: image.filename }
        })
        
        const data = {
            name, latitude, longitude, about, instructions, openingHours, openOnWeekends, images
        }
        // Validation errors handler
        const schema = Yup.object().shape({
            name: Yup.string().required('O nome é obrigatório'),
            latitude: Yup.number().required('A latitude é obrigatória'),
            longitude: Yup.number().required('A longitude é obrigatória'),
            about: Yup.string().required('O campo about é obrigatório e precisa ter no máximo 300 caracteres').max(300),
            instructions: Yup.string().required('O campo instructions é obrigatório'),
            openingHours: Yup.string().required('O campo openingHours é obrigatório'),
            openOnWeekends: Yup.boolean().required('O campo openOnWeekends é obrigatório'),
            images: Yup.array(Yup.object().shape({
                path: Yup.string().required('É obrigatório o envio de ao menos 1 imagem')
            }))
        })
        // Validate req data
        await schema.validate(data, {
            abortEarly: false,
        })

        // Create orphanage object
        const orphanage = OrphanagesRepository.create(data)
        // Execute create
        await OrphanagesRepository.save(orphanage)
        // Return
        return res.status(201).json({message: "success", data: orphanage})
    },

    // -===========================
    // - List Orphanages
    // -===========================
    async list(req: Request, res: Response) {
        // Get table instance
        const OrphanagesRepository = getRepository(Orphanage);
        // Find
        const orphanages = await OrphanagesRepository.find({
            relations: ['images']
        })
        // Return
        return res.status(200).json({message: "success", data: orphanageView.renderMany(orphanages)})
    },

    // -===========================
    // - Show Orphanage
    // -===========================
    async show(req: Request, res: Response) {
        // Validate
        if (!req.params.id) {
            return res.status(400).json({message: "Missing request param id"})
        }
        // Get table instance
        const OrphanagesRepository = getRepository(Orphanage);
        // Find by id or return an error
        const orphanage = await OrphanagesRepository.findOneOrFail(req.params.id, {
            relations: ['images']
        })
        // Return
        return res.status(200).json({message: "success", data: orphanageView.render(orphanage)})
    }
}