export interface IField {
    name: string;
    cost: number;
    description?: string;
    capacity: number;
    ownerId: string;
    slot_duration: number;
}

export interface IFieldUpdate {
    name?: string;
    cost?: number;
    description?: string;
    capacity?: number;
    slot_duration?: number;
}