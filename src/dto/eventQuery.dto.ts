export default interface IEventQueryDto {
    id: string;
    description: string;
    schedule: string;
    location: string;
    expertise: number;
    sportId: number;
    remaining: string;
    duration: number;
    organizerType: string;
    owner: { 
        firstName: string,
        id: number 
    };
    participantStatus?: boolean;
    isRated?: boolean;
    rating: {
        rate: number,
        count: number
    };
    eventStatus?: number;
}