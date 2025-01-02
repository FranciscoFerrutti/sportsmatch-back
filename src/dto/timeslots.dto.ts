import { SlotStatus } from '../constants/slots.constants';

export interface CreateTimeSlotsDTO {
    fieldId: number;
    availabilityDate: string;        // YYYY-MM-DD
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
    slotStatus?: SlotStatus;  // Optional slot status
} 