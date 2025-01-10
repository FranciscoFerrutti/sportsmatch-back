import IEventQueryDto from "../dto/eventQuery.dto";
import { EventQuery } from "../interfaces/event.interface";
import { round } from "../utils/math/math.utils";
import {OrganizerType} from "../constants/event.constants";


export default class EventSearchDtoMapper {
    static toEventSearchDto(eventSearch: EventQuery): IEventQueryDto {
        const owner = {
            firstName: eventSearch.organizer_type === OrganizerType.USER 
                ? eventSearch.owner_firstname || ''
                : eventSearch.owner_name || '',
            id: eventSearch.owner_id
        };

        const userDetailDto: IEventQueryDto = {
            id: eventSearch.event_id.toString(),
            description: eventSearch.description,
            schedule: eventSearch.schedule,
            location: eventSearch.location,
            expertise: +eventSearch.expertise,
            sportId: eventSearch.sport_id,
            remaining: eventSearch.remaining.toString(),
            organizerType: eventSearch.organizer_type,
            owner,
            participantStatus: eventSearch.participant_status,
            rating: {
                rate: round(eventSearch.rating, 2),
                count: eventSearch.rate_count
            },
            isRated: eventSearch.is_rated,
            eventStatus: eventSearch.event_status,
            duration: eventSearch.duration
        }
        return userDetailDto;
    }
}

