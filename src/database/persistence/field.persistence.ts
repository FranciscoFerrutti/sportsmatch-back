import Field from "../models/Field.model"
import {IField, IFieldUpdate} from "../../interfaces/field.interface";

class FieldPersistence{
    static async getClubFields(clubId: string): Promise<Field[] | null>{
        return await Field.findAll({where: {club_id: clubId}})
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
        return await Field.findOne({ where: { id: id }});
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
}

export default FieldPersistence;