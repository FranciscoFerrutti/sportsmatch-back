import { Transaction } from "sequelize";
import sequelize from "../connection";
import Club, {IClubAttributes} from "../models/Club.model";

class ClubPersistence {
    static async createUser(user: IClubAttributes, transaction: Transaction): Promise<Club> {
        const newUser = await Club.create(user, { transaction });
        return newUser;
    }

    static async getUserByEmail(email: string): Promise<Club | null> {
        const user = await Club.findOne({ where: { email } });
        return user;
    }
}

export default ClubPersistence;