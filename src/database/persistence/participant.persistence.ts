import {UniqueConstraintError} from "sequelize";
import DatabaseException from "../../exceptions/dbExceptions/database.exception";
import DuplicateException from "../../exceptions/dbExceptions/duplicate.exception";
import Participant, {IParticipantDetail} from "../models/Participant.model";
import sequelize from "../connection";

class ParticipantPersistence {
    static async createParticipant(eventId: string, userId: string): Promise<Participant> {
        try {
            return await Participant.create({
                eventId: eventId,
                userId: userId,
                status: false
            });
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                throw new DuplicateException("The user was already rated by the rater");
            }
            throw new DatabaseException();
        }
    }

    static async getParticipantsDetailsByEventId(eventId: string): Promise<IParticipantDetail[]> {
        const participants = await sequelize.query(`SELECT 
                    participants.user_id,
                    users.firstname                     as firstname,
                    users.lastname                      as lastname,
                    users.email                         as email,
                    participants.status                 as participant_status,
                    users.phone_number                  as phone_number,
                    users.image_url                     as image_url,
                    COALESCE(avg(rating)::float, 0)     as rating,
                    COALESCE(count(rating)::integer, 0) as count,
                    COALESCE(rated_aux.isRated, FALSE)      as is_rated
                FROM participants
                        left outer join users on participants.user_id = users.id
                        left outer join ratings on participants.user_id = ratings.rated
                        left outer join (
                    select CASE WHEN MAX(1) > 0 THEN TRUE ELSE FALSE END AS isRated, rated from ratings where event_id = :eventId group by rated
                ) as rated_aux on rated_aux.rated = participants.user_id
                WHERE participants.event_id = :eventId
                GROUP BY participants.user_id, users.firstname, users.lastname, users.email, participants.status, users.phone_number, users.image_url,
                    rated_aux.isRated`, {replacements: { eventId }});
        
        return participants[0] as IParticipantDetail[];
    }

    static async updateStatus(eventId: string, userId: string, status: boolean): Promise<Participant> {
        const participant = await Participant.update({ status: status }, { where: { eventId, userId }, returning: true });
        return participant[1][0];
    }

    static async removeParticipant(eventId: string, userId: string): Promise<boolean> {
        const removedParticipant = await Participant.destroy({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });
        return removedParticipant > 0;
    }

    static async getParticipant(eventId: string, userId: string): Promise<boolean> {
        const participant = await Participant.findOne({
            where: {
                event_id: eventId,
                user_id: userId
            }
        });

        return !!participant;


    }

}

export default ParticipantPersistence;