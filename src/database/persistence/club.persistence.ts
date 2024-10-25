import { Transaction } from "sequelize";
import sequelize from "../connection";
import Club, {IClubAttributes} from "../models/Club.model";
import User from "../models/User.model";

class ClubPersistence {
    static async createUser(user: IClubAttributes, transaction: Transaction): Promise<Club> {
        const newUser = await Club.create(user, { transaction });
        return newUser;
    }

    static async getUserByEmail(email: string): Promise<Club | null> {
        const user = await Club.findOne({ where: { email } });
        return user;
    }

    static async getAllUsers(): Promise<Club[]> {
        const users = await Club.findAll();
        return users;
    }
}

export default ClubPersistence;