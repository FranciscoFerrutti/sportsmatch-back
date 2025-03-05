import { Op, Transaction } from "sequelize";
import Auth from "../models/ClubAuth.model";


class ClubAuthPersistence {
    static async createAuth(email: string, password: string, verificationToken: string, transaction: Transaction) {
        const user = await Auth.create({ 
            email, 
            password, 
            verificationToken,
            isVerified: false 
        }, { transaction });
        return user;
    }

    static async getAuthByEmail(email: string): Promise<Auth | null> {
        return await Auth.findOne({ where: { email } });
    }

    static async verifyEmail(verificationToken: string): Promise<Auth | null> {
        const auth = await Auth.findOne({ where: { verificationToken } });
        if (auth) {
            auth.isVerified = true;
            auth.verificationToken = null;
            await auth.save();
        }
        return auth;
    }

    static async isEmailVerified(email: string): Promise<boolean> {
        const auth = await Auth.findOne({ where: { email } });
        return auth?.isVerified || false;
    }
}

export default ClubAuthPersistence;