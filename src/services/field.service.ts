import {IField, IFieldUpdate} from "../interfaces/field.interface";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import FieldPersistence from "../database/persistence/field.persistence";
import Field from "../database/models/Field.model";

class FieldService{
    private static instance: FieldService;

    static getInstance() {
        if (!FieldService.instance) FieldService.instance = new FieldService();
        return FieldService.instance;
    }

    private constructor() {
    }

    private validateSlotDuration(duration: number) {
        const validDurations = [15, 30, 60, 90, 120];
        if (!validDurations.includes(duration)) {
            throw new GenericException({
                message: "Invalid slot duration. Must be one of: 15, 30, 60, 90, 120 minutes",
                status: HTTP_STATUS.BAD_REQUEST,
                internalStatus: "INVALID_SLOT_DURATION"
            });
        }
    }

    public async getFields(clubId: string): Promise<any> {
        return await FieldPersistence.getClubFields(clubId);
    }

    public async createField(field: IField): Promise<void> {
        this.validateSlotDuration(field.slot_duration);
        await FieldPersistence.createField(field);
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

    public async updateField(fieldId: string, clubId: string, fieldData: IFieldUpdate): Promise<void> {
        if (fieldData.slot_duration) {
            this.validateSlotDuration(fieldData.slot_duration);
        }
        const field = await FieldService.checkOwnership(fieldId, clubId);
        await FieldPersistence.updateField(field, fieldData);
    }

    public async removeField(fieldId: string, clubId: string): Promise<void> {
        const field = await FieldService.checkOwnership(fieldId, clubId);
        await FieldPersistence.removeField(field);
    }

}

export default FieldService;