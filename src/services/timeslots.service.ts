import { CreateTimeSlotsDTO } from '../dto/timeslots.dto';
import Field from "../database/models/Field.model";
import TimeSlotPersistence from "../database/persistence/timeslots.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import GenericException from "../exceptions/generic.exception";
import { HTTP_STATUS } from "../constants/http.constants";
import { SlotStatus } from '../constants/slots.constants';
import {Transaction} from "sequelize";
import TimeSlot from "../database/models/TimeSlot.model";
interface ConsecutiveSlots {
    slotIds: number[];
    startTime: Date;
    endTime: Date;
}

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

    async getFieldTimeSlots(
        fieldId: number,
        startDate?: string,
        endDate?: string,
        slotStatus?: SlotStatus,
        startTime?: string,
        endTime?: string
    ) {
        return await this.persistence.getFieldTimeSlots(
            fieldId,
            startDate,
            endDate,
            slotStatus,
            startTime,
            endTime
        );
    }

    async getAvailableTimeSlots(fieldId: number, startDate: string, endDate: string) {
        return await this.persistence.getAvailableTimeSlots(fieldId, startDate, endDate);
    }

    async deleteTimeSlot(fieldId: string, slotId: string, clubId: string) {
        await TimeSlotsService.checkFieldOwnership(fieldId, clubId);
        return await this.persistence.deleteTimeSlot(parseInt(fieldId), parseInt(slotId));
    }

    async updateSlotStatus(fieldId: string, slotId: string, clubId: string, slotStatus: SlotStatus) {
        await TimeSlotsService.checkFieldOwnership(fieldId, clubId);
        
        const slot = await this.persistence.findSlotById(parseInt(fieldId), parseInt(slotId));
        if (!slot) {
            throw new NotFoundException("TimeSlot");
        }

        return await this.persistence.updateSlotStatus(slot, slotStatus);
    }

    public async findConsecutiveAvailableSlots(
        fieldId: number,
        date: Date,
        duration: number
    ): Promise<ConsecutiveSlots[]> {
        return await this.persistence.findConsecutiveAvailableSlots(
            fieldId,
            date,
            duration
        );
    }

    public async getSlotsByIds(slotIds: number[]): Promise<TimeSlot[]> {
        return await this.persistence.getSlotsByIds(slotIds);}

    public async releaseSlots(slotIds: number[], transaction: Transaction): Promise<void> {
        await this.persistence.releaseSlots(slotIds, transaction);
    }
}