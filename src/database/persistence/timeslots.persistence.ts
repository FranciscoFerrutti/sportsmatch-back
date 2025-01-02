import { Transaction } from 'sequelize';
import TimeSlot from '../models/TimeSlot.model';
import { Op } from 'sequelize';
import { SlotStatus } from '../../constants/slots.constants';
import {CreateTimeSlotsDTO} from "../../dto/timeslots.dto";

interface CreateTimeSlotsWithDurationDTO extends CreateTimeSlotsDTO {
    slotDuration: number;
}

export default class TimeSlotPersistence {
    async createTimeSlots(data: CreateTimeSlotsWithDurationDTO) {
        const transaction = await TimeSlot.sequelize!.transaction();

        try {
            const slots = this.generateTimeSlots(data);
            const createdSlots = await TimeSlot.bulkCreate(slots, { transaction });
            
            await transaction.commit();
            return createdSlots;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private generateTimeSlots(data: CreateTimeSlotsWithDurationDTO) {
        const slots = [];
        let currentTime = new Date(`${data.availabilityDate}T${data.startTime}`);
        const endDateTime = new Date(`${data.availabilityDate}T${data.endTime}`);

        while (currentTime < endDateTime) {
            const slotEndTime = new Date(
                currentTime.getTime() + data.slotDuration * 60000
            );
            
            if (slotEndTime > endDateTime) break;

            slots.push({
                field_id: data.fieldId,
                availability_date: data.availabilityDate,
                start_time: this.formatTime(currentTime),
                end_time: this.formatTime(slotEndTime),
                slotStatus: data.slotStatus || SlotStatus.AVAILABLE
            });

            currentTime = slotEndTime;
        }

        return slots;
    }

    private formatTime(date: Date): string {
        return date.toTimeString().slice(0, 5); // Returns HH:mm format
    }

    async findOverlappingSlots(
        fieldId: number,
        date: string,
        startTime: string,
        endTime: string
    ): Promise<TimeSlot[]> {
        return await TimeSlot.findAll({
            where: {
                field_id: fieldId,
                availability_date: date,
                [Op.or]: [
                    {
                        [Op.and]: {
                            start_time: { [Op.lt]: endTime },
                            end_time: { [Op.gt]: startTime }
                        }
                    }
                ]
            }
        });
    }

    async getFieldTimeSlots(
        fieldId: number, 
        date?: string, 
        slotStatus?: SlotStatus,
        startTime?: string,
        endTime?: string
    ) {
        const where: any = { field_id: fieldId };
        
        if (date) {
            where.availability_date = date;
        }
        
        if (slotStatus) {
            where.slotStatus = slotStatus;
        }
        
        if (startTime) {
            where.start_time = where.start_time || {};
            where.start_time[Op.gte] = startTime;
        }
        
        if (endTime) {
            where.end_time = where.end_time || {};
            where.end_time[Op.lte] = endTime;
        }

        return await TimeSlot.findAll({
            where,
            order: [
                ['availability_date', 'ASC'],
                ['start_time', 'ASC']
            ]
        });
    }

    async getAvailableTimeSlots(fieldId: number, startDate: string, endDate: string) {
        return await TimeSlot.findAll({
            where: {
                field_id: fieldId,
                availability_date: {
                    [Op.between]: [startDate, endDate]
                },
                slotStatus: SlotStatus.AVAILABLE
            },
            order: [
                ['availability_date', 'ASC'],
                ['start_time', 'ASC']
            ]
        });
    }

    async deleteTimeSlot(fieldId: number, slotId: number) {
        return await TimeSlot.destroy({
            where: {
                id: slotId,
                field_id: fieldId
            }
        });
    }

    async findSlotById(fieldId: number, slotId: number) {
        return await TimeSlot.findOne({
            where: {
                id: slotId,
                field_id: fieldId
            }
        });
    }

    async updateSlotStatus(slot: TimeSlot, slotStatus: SlotStatus) {
        slot.slotStatus = slotStatus;
        await slot.save();
        return slot;
    }
} 