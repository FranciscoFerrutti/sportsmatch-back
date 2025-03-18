import { ReservationStatus } from "../constants/reservation.constants";

export interface IAvailableSlotGroup {
    fieldId: number;
    clubId: number;
    clubName: string;
    location: string;
    availableSlots: {
        slotIds: number[];
        startTime: Date;
        endTime: Date;
        totalCost: number;
    }[];
}

export interface IReservationCreate {
    eventId: number;
    fieldId: number;
    slotIds: number[];
    userId: number;
}

export interface IReservationDetail {
    id: number;
    eventId: number;
    fieldId: number;
    status: ReservationStatus;
    cost: number;
    timeSlots: {
        id: number;
        startTime: Date;
        endTime: Date;
        date: Date;
    }[];
    field: {
        name: string;
        clubId: number;
        clubName: string;
        description: string | null;
        address: string | null;
    };
} 