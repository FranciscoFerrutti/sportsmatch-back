import { IEvent } from "../interfaces/event.interface";
import { Page } from "../interfaces/api.interface";
import EventPersistence from "../database/persistence/event.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import IEventDetailDto from "../dto/eventDetail.dto";
import IEventQueryDto from "../dto/eventQuery.dto";
import EventDetailDtoMapper from "../mapper/eventDetailDto.mapper";
import EventSearchDtoMapper from "../mapper/eventSearchDto.mapper";

class EventsService {
    private static readonly instance: EventsService;

    private constructor() {
    }

    public static getInstance(): EventsService {
        if (!this.instance) return new EventsService();
        return this.instance;
    }

    public async getEventById(eventId: string): Promise<IEventDetailDto> {
        const event = await EventPersistence.getEventDetailById(eventId.toString());
        if (!event) throw new NotFoundException("Event");

        return EventDetailDtoMapper.toEventDetailDto(event);
    }

    public async getEvents(queryFilters: Record<string, string>, page = 0, limit = 20): Promise<Page<IEventQueryDto>> {
        const events = await EventPersistence.getEvents(queryFilters, page, limit);

        const eventsDtos = events.map((event) => {
            return EventSearchDtoMapper.toEventSearchDto(event);
        });

        return {
            page: page,
            pageSize: events.length,
            items: eventsDtos
        };
    }

    public async createEvent(event: IEvent): Promise<void> {
        await EventPersistence.createEvent(event);
    }
}

export default EventsService;