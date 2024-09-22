import IEventQueryDto from "../dto/eventQuery.dto";
import { EventQuery } from "../interfaces/event.interface";
import { round } from "../utils/math/math.utils";


export default class EventSearchDtoMapper {
    static toEventSearchDto(eventSearch: EventQuery): IEventQueryDto {
        const userDetailDto: IEventQueryDto = {
            id: eventSearch.event_id.toString(),
            description: eventSearch.description,
            schedule: eventSearch.schedule,
            location: eventSearch.location,
            expertise: +eventSearch.expertise,
            sportId: eventSearch.sport_id,
            remaining: eventSearch.remaining.toString(),
            owner: {
                firstName: eventSearch.owner_firstname,
                id: eventSearch.owner_id
            },
            participantStatus: eventSearch.participant_status,
            rating: {
                rate: round(eventSearch.rating, 2),
                count: eventSearch.rate_count
            },
            isRated: eventSearch.is_rated,
            eventStatus: eventSearch.event_status
        }
        return userDetailDto;
    }
}

