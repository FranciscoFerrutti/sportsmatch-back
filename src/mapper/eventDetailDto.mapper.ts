import { IEventDetail } from "../database/models/Event.model";
import IEventDetailDto from "../dto/eventDetail.dto";



export default class EventDetailDtoMapper {
    static toEventDetailDto(event: IEventDetail): IEventDetailDto {
        const eventDetailDto: IEventDetailDto = {
            id: event.event_id.toString(),
            description: event.description,
            schedule: event.schedule,
            location: event.location,
            expertise: event.expertise,
            sportId: event.sportId,
            remaining: event.remaining,
            status: event.status,
            owner: {
                firstName: event.owner.firstname,
                id: event.owner.id
            }
        }
        return eventDetailDto;
    }
}