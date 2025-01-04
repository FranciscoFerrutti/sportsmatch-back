import { OrganizerType } from "../constants/event.constants";

export interface IEvent {
    ownerId: string,
    organizerType: OrganizerType,
    sportId: number,
    expertise: number,
    location: string,
    schedule: string,
    description: string,
    duration: number,
    remaining: number
}

export interface EventQuery {
    event_id: number;
    description: string;
    schedule: string;
    location: string;
    expertise: string;
    sport_id: number;
    remaining: number;
    organizer_type: OrganizerType;
    owner_firstname?: string;
    owner_name?: string;
    owner_id: number;
    participant_status?: boolean;
    is_rated?: boolean;
    rating: number;
    rate_count: number;
    event_status?: number;
}