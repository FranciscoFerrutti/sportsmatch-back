import { Transaction } from 'sequelize';
import TimeSlot from '../models/TimeSlot.model';
import { Op } from 'sequelize';
import { SlotStatus } from '../../constants/slots.constants';
import {CreateTimeSlotsDTO} from "../../dto/timeslots.dto";
import Field from "../models/Field.model";

interface ConsecutiveSlots {
    slotIds: number[];
    startTime: Date;
    endTime: Date;
}
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

    async findConsecutiveAvailableSlots(
        fieldId: number,
        date: Date,
        duration: number
    ) {
        //TODO: NO ESTA MATCHEANDO POR HORA DE INICIO(+=- CUANTAS HORAS)?

        // Adjust the input date to Argentina timezone (UTC-3)
        const argentinaDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));

        // Get field to know slot duration
        const field = await Field.findByPk(fieldId);
        if (!field) return [];

        const slotsNeeded = Math.ceil(duration / field.slot_duration);
        const slots = await TimeSlot.findAll({
            where: {
                field_id: fieldId,
                availability_date: argentinaDate,
                slotStatus: SlotStatus.AVAILABLE
            },
            order: [['start_time', 'ASC']]
        });

        const consecutiveGroups: ConsecutiveSlots[] = [];
        let currentGroup: number[] = [];
        
        // Process all slots
        for (let i = 0; i < slots.length; i++) {
            const currentSlot = slots[i];
            
            if (currentGroup.length === 0) {
                currentGroup.push(currentSlot.id);
            } else {
                const prevSlot = slots[i - 1];
                
                // Check if slots are consecutive
                const prevEndTime = prevSlot.end_time;
                const currentStartTime = slots[i].start_time;
                if (prevEndTime === currentStartTime) {
                    currentGroup.push(currentSlot.id);
                } else {
                    // If we have enough consecutive slots, add them to groups
                    if (currentGroup.length >= slotsNeeded) {
                        consecutiveGroups.push({
                            slotIds: [...currentGroup],
                            startTime: slots[i - currentGroup.length].start_time,
                            endTime: slots[i - 1].end_time
                        });
                    }
                    // Start a new group
                    currentGroup = [currentSlot.id];
                }
            }

            // Check if we need to add the last group in the current iteration
            if (i === slots.length - 1 && currentGroup.length >= slotsNeeded) {
                consecutiveGroups.push({
                    slotIds: [...currentGroup],
                    startTime: slots[i - (currentGroup.length - 1)].start_time,
                    endTime: slots[i].end_time
                });
            }
        }

        return consecutiveGroups;
    }

    async getSlotsByIds(slotIds: number[]): Promise<TimeSlot[]> {
        return await TimeSlot.findAll({
            where: {
                id: slotIds
            },
            include: [{
                model: Field,
                attributes: ['id', 'slot_duration', 'cost_per_minute']
            }]
        });
    }

    async releaseSlots(
        slotIds: number[],
        transaction: Transaction
    ): Promise<void> {
        await TimeSlot.update(
            {
                reservationId: null,
                slotStatus: SlotStatus.AVAILABLE
            },
            {
                where: {
                    id: slotIds
                },
                transaction
            }
        );
    }

    async validateSlots(slotIds: number[], fieldId: number): Promise<TimeSlot[]> {
        return await TimeSlot.findAll({
            where: {
                id: slotIds,
                field_id: fieldId,
                slotStatus: SlotStatus.AVAILABLE
            },
            order: [['start_time', 'ASC']]
        });
    }

    // async updateSlotStatus(
    //     slotIds: number[],
    //     status: SlotStatus,
    //     transaction: Transaction
    // ): Promise<void> {
    //     await TimeSlot.update(
    //         { slotStatus: status },
    //         {
    //             where: { id: slotIds },
    //             transaction
    //         }
    //     );
    // }

    async getSlotsByFieldAndDate(
        fieldId: number,
        date: Date
    ): Promise<TimeSlot[]> {
        return await TimeSlot.findAll({
            where: {
                field_id: fieldId,
                availability_date: date
            },
            order: [['start_time', 'ASC']]
        });
    }
} 