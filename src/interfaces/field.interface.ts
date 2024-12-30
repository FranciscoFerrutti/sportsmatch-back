export interface IField {
    ownerId: string,
    name: string,
    cost: number,
    description: string,
    capacity: number,
}

export interface IFieldUpdate {
    name?: string,
    cost?: number,
    description?: string,
    capacity?: number,
}