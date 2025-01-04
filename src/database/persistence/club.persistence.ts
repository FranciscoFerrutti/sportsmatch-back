import { Transaction } from "sequelize";
import sequelize from "../connection";
import Club, {IClubAttributes} from "../models/Club.model";
import User from "../models/User.model";

class ClubPersistence {
    static async createClub(user: IClubAttributes, transaction: Transaction): Promise<Club> {
        const newUser = await Club.create(user, { transaction });
        return newUser;
    }

    static async getClubByEmail(email: string): Promise<Club | null> {
        const user = await Club.findOne({ where: { email } });
        return user;
    }

    static async getAllClubs(): Promise<Club[]> {
        const users = await Club.findAll();
        return users;
    }

    static async getClubById(id: string): Promise<Club | null> {
        const club = await Club.findByPk(id);
        return club;
    }
}

export default ClubPersistence;