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
    owner_firstname: string;
    owner_id: number;
    participant_status?: boolean; // these two are for participants id filter
    is_rated?: boolean;
    rating: number; // From here to the end are for getEvents
    rate_count: number;
    event_status?: number;
}