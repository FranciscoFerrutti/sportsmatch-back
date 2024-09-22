

export default interface IEventQueryDto {
    id: string;
    description: string;
    schedule: string;
    location: string;
    expertise: number;
    sportId: number;
    remaining: string;
    owner: { 
        firstName: string,
        id: number 
    };
    participantStatus?: boolean; // these two are for participants id filter
    isRated?: boolean;
    rating: {
        rate: number,
        count: number
    };
    eventStatus?: number;
}