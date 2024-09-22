import { Transaction } from "sequelize";
import sequelize from "../connection";
import Rating from "../models/Rating.model";
import User, { IUserAttributes, IUserDetail } from "../models/User.model";
import UserLocation from "../models/UserLocation.model";
import UserSport from "../models/UserSport.model";

class UserPersistence {

    static async updatePhoneNumber(userId: number, phoneNumber: string): Promise<User> {
        const user = await User.update({ phone_number: phoneNumber }, { where: { id: userId }, returning: true });

        return user[1][0];
    }

    static async getAllUsers(): Promise<User[]> {
        const users = await User.findAll();
        return users;
    }

    static async createUser(user: IUserAttributes, transaction: Transaction): Promise<User> {
        const newUser = await User.create(user, { transaction });
        return newUser;
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        const user = await User.findOne({ where: { email } });
        return user;
    }

    static async getUserDetailById(id: string): Promise<IUserDetail | null> {
        const userDetail = await sequelize.query(`SELECT
                u.id AS user_id,
                u.firstname,
                u.lastname,
                u.phone_number as phone_number,
                u.birthdate as birth_date,
                u.email,
                ARRAY_AGG(DISTINCT (us.sport_id)) AS sports,
                ARRAY_AGG(DISTINCT ul.location) AS locations,
                COALESCE(avg(r.rating)::float, 0) as rating,
                COALESCE(r.count_ratings, 0)::integer as count
            FROM users u
            LEFT JOIN users_sports us ON u.id = us.user_id
            LEFT JOIN users_locations ul ON u.id = ul.user_id
            LEFT JOIN (
                SELECT rated, AVG(rating) AS rating, COUNT(*) AS count_ratings
                FROM ratings
                GROUP BY rated
            ) r ON u.id = r.rated
            WHERE u.id = :id
            GROUP BY u.id, r.count_ratings;`, { replacements: { id } });

        const user = userDetail[0][0] as IUserDetail;
        user.sports = user.sports.filter((sport) => sport !== null);
        user.locations = user.locations.filter((location) => location !== null);
        return user;
    }
}

export default UserPersistence;