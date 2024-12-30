import {IField, IFieldUpdate} from "../interfaces/field.interface";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import FieldPersistence from "../database/persistence/field.persistence";
import Field from "../database/models/Field.model";

class FieldService{
    private static readonly instance: FieldService;

    private constructor() {
    }

    public static getInstance(): FieldService {
        if (!this.instance) return new FieldService();
        return this.instance;
    }

    public async getFields(clubId: string): Promise<any> {
        return await FieldPersistence.getClubFields(clubId);
    }

    public async createField(field: IField): Promise<void> {
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
        const field = await FieldService.checkOwnership(fieldId, clubId);
        await FieldPersistence.updateField(field, fieldData);
    }

    public async removeField(fieldId: string, clubId: string): Promise<void> {
        const field = await FieldService.checkOwnership(fieldId, clubId);
        await FieldPersistence.removeField(field);
    }

}

export default FieldService;