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

    static async updateClub(clubId: string, updateData: Partial<Club>, transaction?: Transaction): Promise<void> {
        console.log(`🔄 Actualizando club ${clubId} con datos:`, updateData);

        const [updatedRows] = await Club.update(updateData, {
            where: { id: clubId },
            transaction,
        });

        if (updatedRows === 0) {
            console.warn(`⚠️ No se encontró el club con ID ${clubId} o no hubo cambios.`);
            throw new Error("Club no encontrado o sin cambios.");
        }

        console.log("✅ Club actualizado con éxito.");
    }
}

export default ClubPersistence;