import { EventQuery, IEvent } from "../../interfaces/event.interface";
import sequelize from "../connection";
import Event, { IEventDetail } from "../models/Event.model"
import Participant from "../models/Participant.model";
import User from "../models/User.model";
import { QueryBuilder } from "../utils/postgres.database";
import Club from "../models/Club.model";
import {OrganizerType} from "../../constants/event.constants";
import NotFoundException from "../../exceptions/notFound.exception";

class EventPersistence {
    static async createEvent(event: IEvent): Promise<Event> {
        const newEvent = await Event.create({
            ownerId: event.ownerId,
            organizerType: event.organizerType,
            sportId: event.sportId,
            expertise: event.expertise,
            location: event.location,
            schedule: event.schedule,
            description: event.description,
            duration: event.duration,
            remaining: event.remaining
        });

        return newEvent;
    }

    // TODO: this is legacy too hard to improve
    static async getEvents(queryFilters: Record<string, string>, page: number, limit: number): Promise<EventQuery[]> {// return event detail
        const participantIdFilter = queryFilters.participantId?.toString().trim() !== undefined;
        const filterOut = !!queryFilters.filterOut;

        await sequelize.query(`SET TIME ZONE 'America/Argentina/Buenos_Aires'`); // TODO this is a test remove

        const queryBuilder = new QueryBuilder(`SELECT
        events.id AS event_id,
        events.description,
        events.schedule::text as schedule,
        events.location,
        events.expertise,
        events.sport_id,
        events.organizer_type,
        events.duration,
        (events.remaining - COUNT(CASE WHEN participants.status = true THEN participants.id ELSE NULL END))::integer AS remaining,
        CASE 
            WHEN events.organizer_type = '${OrganizerType.USER}' THEN users.firstname
            ELSE NULL
        END as owner_firstname,
        CASE 
            WHEN events.organizer_type = '${OrganizerType.CLUB}' THEN clubs.name
            ELSE NULL
        END as owner_name,
        events.owner_id,
        ${participantIdFilter ? "participants.status as participant_status," : ""}
        ${participantIdFilter ? "COALESCE(rated_aux.isRated, FALSE) as is_rated," : ""}
        COALESCE(rate.rating::float, 0) as rating,
        COALESCE(rate.count::integer, 0) as rate_count,
        CASE
            WHEN events.schedule > CURRENT_TIMESTAMP THEN 0
            WHEN events.schedule <= CURRENT_TIMESTAMP AND events.schedule + (events.duration * INTERVAL '1 minute') >= CURRENT_TIMESTAMP THEN 1
            ELSE 2
        END AS event_status
        FROM events
        LEFT JOIN users ON events.owner_id = users.id AND events.organizer_type = '${OrganizerType.USER}'
        LEFT JOIN clubs ON events.owner_id = clubs.id AND events.organizer_type = '${OrganizerType.CLUB}'
        LEFT JOIN participants ON events.id = participants.event_id
        LEFT JOIN (
            SELECT rated, avg(rating) as rating, count(rating) as count FROM ratings GROUP BY rated
        ) as rate ON events.owner_id = rate.rated
        ${participantIdFilter ? `LEFT JOIN (
            SELECT CASE WHEN MAX(1) > 0 THEN TRUE ELSE FALSE END AS isRated, event_id from ratings where rater = ${queryFilters.participantId} group by event_id
        ) as rated_aux ON rated_aux.event_id = events.id` :
            ""}\n`);

    if (queryFilters !== undefined) {
        const sportId = queryFilters.sportId?.toString().trim();
        if (sportId !== undefined) {
            const sports = sportId.split(",");
            if (sports.length > 1) {
                queryBuilder.addFilter(`sport_id IN (${sports.join(",")})`);
            } else
                queryBuilder.addFilter(`sport_id = ${sportId}`);
        }

        const userId = queryFilters.userId?.toString().trim();
        if (userId !== undefined) queryBuilder.addFilter(`events.owner_id ${filterOut ? "!" : ""}= ${userId}`);

        const organizerType = queryFilters.organizerType?.toString().trim();
        if (organizerType !== undefined) queryBuilder.addFilter(`events.organizer_type = '${organizerType}'`);

        const participantId = queryFilters.participantId?.toString().trim();
        if (participantIdFilter) queryBuilder.addFilter(`participants.user_id ${filterOut ? "!" : ""}= ${participantId}`);

        const location = queryFilters.location?.toString().trim();
        if (location !== undefined) {
            const locations = location.split(",");
            if (locations.length > 1) {
                queryBuilder.addFilter(`events.location IN ('${locations.join("','")}')`);
            } else
                queryBuilder.addFilter(`events.location = '${location}'`);
        }

        const expertise = queryFilters.expertise?.toString().trim();
        if (expertise !== undefined) queryBuilder.addFilter(`events.expertise = ${expertise}`);

        const date = queryFilters.date?.toString();
        if (date !== undefined) queryBuilder.addFilter(`TO_CHAR(schedule, 'YYYY-MM-DD') = '${date}'`);

        const schedule = queryFilters.schedule?.toString().trim();
        if (schedule !== undefined) queryBuilder.addFilter(this.getTimeEventFilter(schedule));

        if (userId === undefined && participantId === undefined)
            queryBuilder.addFilter(`events.schedule >= CURRENT_TIMESTAMP`);
    }

    queryBuilder.addGroupBy(`events.id, users.firstname, users.id, clubs.name, clubs.id, events.duration`);
    if (participantIdFilter) queryBuilder.addGroupBy(`participants.status`);
    queryBuilder.addGroupBy(`rate.rating, rate.count`);
    if (participantIdFilter)
        queryBuilder.addGroupBy(`rated_aux.isRated`);
    queryBuilder.addOrderBy(`events.schedule ASC `);
    queryBuilder.addPagination(page, limit);

        const events = await sequelize.query(queryBuilder.build());

        return events[0].map((event: any) => {
            return {
                event_id: event.event_id,
                description: event.description,
                schedule: event.schedule,
                organizer_type: event.organizer_type,
                location: event.location,
                expertise: event.expertise,
                sport_id: event.sport_id,
                remaining: event.remaining,
                owner_firstname: event.owner_firstname,
                owner_name: event.owner_name,
                owner_id: event.owner_id,
                participant_status: event.participant_status,
                is_rated: event.is_rated,
                rating: event.rating,
                rate_count: event.rate_count,
                event_status: event.event_status,
                duration: event.duration
            };
        });
    }

    private static getTimeEventFilter(schedule: string): string {

        const times = `{${schedule.split(",")}}`

        return `
         ((EXTRACT(HOUR FROM events.schedule) >= 6 AND EXTRACT(HOUR FROM events.schedule) < 12 AND 0 = ANY('${times}')) OR
        (EXTRACT(HOUR FROM events.schedule) >= 12 AND EXTRACT(HOUR FROM events.schedule) < 18 AND 1 = ANY('${times}')) OR
        ((EXTRACT(HOUR FROM events.schedule) >= 18 OR EXTRACT(HOUR FROM events.schedule) < 6) AND 2 = ANY('${times}')))
        `;
    }

    static async getEventDetailById(eventId: string): Promise<IEventDetail | null> {
        const eventDetails = await Event.findOne({
            where: { id: eventId },
            attributes: [
                ['id', 'event_id'],
                'description',
                [sequelize.literal('schedule::text'), 'schedule'],
                'location',
                'expertise',
                'sportId',
                'organizerType',
                'duration',
                [sequelize.literal('remaining - COUNT(participants.id)'), 'remaining'],
                [
                    sequelize.literal(`
                        CASE
                            WHEN schedule > CURRENT_TIMESTAMP THEN 0
                            WHEN schedule <= CURRENT_TIMESTAMP AND schedule + (duration * INTERVAL '1 minute') >= CURRENT_TIMESTAMP THEN 1
                            ELSE 2
                        END
                    `),
                    'status'
                ]
            ],
            include: [
                {
                    model: User,
                    as: 'userOwner',
                    attributes: ['firstname', 'id', 'email'],
                    required: false,
                },
                {
                    model: Club,
                    as: 'clubOwner',
                    attributes: ['name', 'id', 'email'],
                    required: false,
                },
                {
                    model: Participant,
                    where: { status: true },
                    required: false,
                    attributes: [],
                },
            ],
            group: ['Event.id', 'userOwner.id', 'clubOwner.id'],
        });

        if (!eventDetails) return null;

        const result = eventDetails.toJSON() as IEventDetail;
        return result;
    }

    static async getEventById(id: string): Promise<Event | null > {
        return await Event.findOne({ where: { id: id }});
    }

    static async updateEvent(eventId: string, updateData: {
        location?: string;
        schedule?: Date;
        duration?: number;
    }): Promise<Event> {
        const event = await Event.findByPk(eventId);
        if (!event) {
            throw new NotFoundException("Event");
        }

        await event.update(updateData);
        return event;
    }

    static async getEventByIdWithParticipants(id: string): Promise<Event | null > {
        return await Event.findOne({ where: { id: id }, include: { model: Participant, attributes: ['userId', 'status'] }});
    }

    static async deleteEvent(eventId: string): Promise<number> {
        return await Event.destroy({
            where: {
                id: eventId
            }
        });
    }
}

export default EventPersistence;