export default interface IEventDetailDto {
    id: string;
    description: string;
    schedule: string;
    location: string;
    expertise: number;
    sportId: number;
    remaining: string;
    duration: number;
    owner: { 
        firstName: string,
        id: number,
        email: string,
        address?: string
    }
    status: number;
    organizerType: string;
}