import { Op, Transaction } from "sequelize";
import Auth from "../models/ClubAuth.model";


class ClubAuthPersistence {
    static async createAuth(email: string, password: string, transaction: Transaction) {
        const user = await Auth.create({ email, password }, { transaction });
        return user;
    }

    static async getAuthByEmail(email: string): Promise<Auth | null> {
        return await Auth.findOne({ where: { email } });
    }
}

export default ClubAuthPersistence;