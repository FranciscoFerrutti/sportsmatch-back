import {IField, IFieldUpdate} from "../interfaces/field.interface";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import FieldPersistence from "../database/persistence/field.persistence";
import Field from "../database/models/Field.model";
import FieldSport from "../database/models/FieldSport.model";

class FieldService{
    private static instance: FieldService;

    static getInstance() {
        if (!FieldService.instance) FieldService.instance = new FieldService();
        return FieldService.instance;
    }

    private constructor() {
    }

    private validateSlotDuration(duration: number) {
        if (duration <= 0 || duration > 1440 || duration % 30 !== 0) {
            throw new GenericException({
                message: "Invalid slot duration. Must be a multiple of 30 minutes and between 30 and 1440 minutes (24 hours).",
                status: HTTP_STATUS.BAD_REQUEST,
                internalStatus: "INVALID_SLOT_DURATION"
            });
        }
    }


    public async getFields(clubId: string): Promise<any> {
        const fields = await FieldPersistence.getClubFields(clubId);

        console.log("📢 Datos obtenidos de la BD en getFields:", JSON.stringify(fields, null, 2));

        return fields?.map(field => ({
            id: field.id,
            name: field.name,
            description: field.description,
            cost: field.cost_per_minute,
            capacity: field.capacity,
            slot_duration: field.slot_duration,
            sports: field.sports?.map(sport => ({
                id: sport.id,
                name: sport.name
            })) || []
        })) || [];
    }

    public async getAllFields(): Promise<any> {
        const fields = await FieldPersistence.getAllFields(); // Nuevo método en el modelo
        console.log("📢 Datos obtenidos de la BD en getAllFields:", JSON.stringify(fields, null, 2));

        return fields?.map(field => ({
            id: field.id,
            name: field.name,
            description: field.description,
            cost: field.cost_per_minute,
            capacity: field.capacity,
            slot_duration: field.slot_duration,
            sports: field.sports?.map(sport => ({
                id: sport.id,
                name: sport.name
            })) || [],
            club_id: field.club_id
        })) || [];
    }

    public async createField(field: IField): Promise<Field> {
        this.validateSlotDuration(field.slot_duration);
        const transaction = await Field.sequelize!.transaction();
        
        try {
            const createdField = await FieldPersistence.createField(field);
            
            // Create sport associations
            await FieldPersistence.associateFieldSports(createdField.id, field.sportIds, transaction);
            
            await transaction.commit();

            return createdField;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private static async checkOwnership(fieldId: string, clubId: string): Promise<Field> {
        const field = await FieldPersistence.getFieldById(fieldId);
        if (!field) throw new NotFoundException("Field");
        if (field.club_id.toString() !== clubId) {
            throw new GenericException({ 
                message: "User is not the owner of the field", 
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "NOT_OWNER" 
            });
        }
        return field;
    }

    public async updateField(fieldId: string, clubId: string, fieldData: IFieldUpdate): Promise<Field | null> {
        if (fieldData.slot_duration) {
            this.validateSlotDuration(fieldData.slot_duration);
        }

        const field = await FieldService.checkOwnership(fieldId, clubId);
        if (!field) return null;

        const transaction = await Field.sequelize!.transaction();

        try {
            await FieldPersistence.updateField(field, fieldData);

            if (fieldData.sportIds && fieldData.sportIds.length > 0) {
                await FieldPersistence.updateFieldSports(field.id, fieldData.sportIds, transaction);
            }

            await transaction.commit();
            return field;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async removeField(fieldId: string, clubId: string): Promise<boolean> {
        const field = await FieldService.checkOwnership(fieldId, clubId);
        if (!field) return false; // Si la cancha no existe, devolvemos false

        await FieldPersistence.removeField(field);
        return true; // Devolvemos true si se eliminó correctamente
    }

    public async getFieldById(fieldId: string): Promise<Field> {
        const field = await FieldPersistence.getFieldById(fieldId);
        if (!field) {
            throw new NotFoundException("Field");
        }
        return field;
    }

    public async getFieldsByClubAndSport(clubId: string, sportId: number): Promise<any> {
        const fields = await FieldPersistence.getFieldsBySport(clubId, sportId);
        console.log(clubId, sportId)
        console.log(fields)

        // Include additional field information needed for reservations
        return await Promise.all(fields.map(async (field) => {
            const fullField = await this.getFieldById(field.id.toString());
            const club = await fullField.$get('club', {
                include: ['location']
            });
            return {
                ...fullField.toJSON(),
                club
            };
        }));
    }

    public async validateFieldAccess(fieldId: number, clubId: number): Promise<void> {
        const field = await this.getFieldById(fieldId.toString());
        if (field.club_id !== clubId) {
            throw new GenericException({
                message: "Field does not belong to club",
                status: HTTP_STATUS.FORBIDDEN,
                internalStatus: "INVALID_FIELD_ACCESS"
            });
        }
    }

}

export default FieldService;