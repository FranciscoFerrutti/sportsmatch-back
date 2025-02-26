import { Transaction } from "sequelize";
import Field from "../models/Field.model"
import Sport from "../models/Sport.model"
import FieldSport from "../models/FieldSport.model"
import {IField, IFieldUpdate} from "../../interfaces/field.interface";
import Club from "../models/Club.model";
import ClubLocation from "../models/ClubLocation.model";

class FieldPersistence{
    static async getClubFields(clubId: string): Promise<Field[] | null>{
        return await Field.findAll({
            where: { club_id: clubId },
            include: [
                {
                    model: Sport,
                    through: { attributes: [] },
                    attributes: ['id', 'name']
                }
            ]
        });
    }

    static async getAllFields(): Promise<Field[] | null> {
        return await Field.findAll({
            attributes: ['id', 'name', 'description', 'cost_per_slot', 'capacity', 'slot_duration', 'club_id'], // Agregar club_id aquí
            include: [
                {
                    model: Sport,
                    through: { attributes: [] },
                    attributes: ['id', 'name']
                }
            ]
        });
    }

    static async createField(field: IField): Promise<Field>{
        return await Field.create({
            name: field.name,
            cost_per_minute: field.cost,
            description: field.description,
            capacity: field.capacity,
            club_id: field.ownerId,
            slot_duration: field.slot_duration
        });
    }

    static async getFieldById(id: string): Promise<Field | null > {
        return await Field.findOne({
            where: { id },
            include: [
                {
                    model: Club,
                    include: [{
                        model: ClubLocation,
                        attributes: ['address', 'latitude', 'longitude']
                    }]
                },
                {
                    model: Sport,
                    through: { attributes: [] } // Exclude junction table attributes
                }
            ]
        });
    }

    static async updateField(field: Field, fieldData: IFieldUpdate) {
        await field.update({
            name: fieldData.name,
            cost_per_minute: fieldData.cost,
            description: fieldData.description,
            capacity: fieldData.capacity,
            slot_duration: fieldData.slot_duration
        });
    }

    static async removeField(field: Field){
        await field.destroy();
    }

    static async getFieldsBySport(clubId: string, sportId: number): Promise<Field[]> {
        return await Field.findAll({
            where: { club_id: clubId },
            include: [
                {
                    model: Sport,
                    where: { id: sportId },
                    through: { attributes: [] }
                },
                {
                    model: Club,
                    include: [{
                        model: ClubLocation,
                        attributes: ['address', 'latitude', 'longitude']
                    }]
                }
            ]
        });
    }

    static async associateFieldSports(
        fieldId: number, 
        sportIds: number[], 
        transaction: Transaction
    ): Promise<void> {
        const fieldSports = sportIds.map(sportId => ({
            fieldId,
            sportId
        }));
        
        await FieldSport.bulkCreate(fieldSports, { transaction });
    }

    static async updateFieldSports(
        fieldId: number,
        sportIds: number[],
        transaction: Transaction
    ): Promise<void> {
        // Remove existing associations
        await FieldSport.destroy({
            where: { fieldId },
            transaction
        });

        // Create new associations
        await this.associateFieldSports(fieldId, sportIds, transaction);
    }
}

export default FieldPersistence;