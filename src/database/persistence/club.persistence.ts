import { Transaction } from "sequelize";
import Club, {IClubAttributes} from "../models/Club.model";
import ClubLocation from "../models/ClubLocation.model";

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
        const club = await Club.findByPk(id, {
            include: [{
                model: ClubLocation,
                attributes: ['locality', 'address'],
                required: false
            }]
        });
        return club;
    }

    static async updateClub(clubId: string, updateData: Partial<Club>, transaction?: Transaction): Promise<void> {

        await Club.update(updateData, {
            where: { id: clubId },
            transaction,
        });
    }
}

export default ClubPersistence;