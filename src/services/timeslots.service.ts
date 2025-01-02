import { CreateTimeSlotsDTO } from '../dto/timeslots.dto';
import Field from "../database/models/Field.model";
import TimeSlotPersistence from "../database/persistence/timeslots.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import { HTTP_STATUS } from "../constants/http.constants";

export default class TimeSlotsService {
    private static instance: TimeSlotsService;
    private persistence: TimeSlotPersistence = new TimeSlotPersistence();

    static getInstance() {
        if (!TimeSlotsService.instance) TimeSlotsService.instance = new TimeSlotsService();
        return TimeSlotsService.instance;
    }

    private constructor() {}

    private static async checkFieldOwnership(fieldId: string, clubId: string): Promise<Field> {
        const field = await Field.findByPk(fieldId);
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

    private async checkOverlappingSlots(
        fieldId: number, 
        date: string, 
        startTime: string, 
        endTime: string
    ): Promise<boolean> {
        const existingSlots = await this.persistence.findOverlappingSlots(
            fieldId,
            date,
            startTime,
            endTime
        );

        if (existingSlots.length > 0) {
            throw new GenericException({
                message: "There are overlapping slots in the specified time range",
                status: HTTP_STATUS.BAD_REQUEST,
                internalStatus: "OVERLAPPING_SLOTS"
            });
        }

        return false;
    }

    async createTimeSlotsForField(data: CreateTimeSlotsDTO, clubId: string) {
        const field = await TimeSlotsService.checkFieldOwnership(data.fieldId.toString(), clubId);

        await this.checkOverlappingSlots(
            data.fieldId,
            data.availabilityDate,
            data.startTime,
            data.endTime
        );

        return await this.persistence.createTimeSlots({
            ...data,
            slotDuration: field.slot_duration
        });
    }

    async getFieldTimeSlots(fieldId: number, date?: string) {
        return await this.persistence.getFieldTimeSlots(fieldId, date);
    }

    async getAvailableTimeSlots(fieldId: number, startDate: string, endDate: string) {
        return await this.persistence.getAvailableTimeSlots(fieldId, startDate, endDate);
    }

    async deleteTimeSlot(fieldId: string, slotId: string, clubId: string) {
        await TimeSlotsService.checkFieldOwnership(fieldId, clubId);
        return await this.persistence.deleteTimeSlot(parseInt(fieldId), parseInt(slotId));
    }
} 