import DatabaseException from "../../exceptions/dbExceptions/database.exception";
import DuplicateException from "../../exceptions/dbExceptions/duplicate.exception";
import Rating from "../models/Rating.model";
import { UniqueConstraintError } from "sequelize";

class RatingPersistence {
    static async rate(rated: string, rater: string, rating: number, eventId: string): Promise<void> {
        try {
            await Rating.create({
                rater: rater,
                rated: rated,
                rating: rating,
                eventId: eventId
            });
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                throw new DuplicateException("The user was already rated by the rater");
            }
            throw new DatabaseException();
        }
    }
}

export default RatingPersistence;