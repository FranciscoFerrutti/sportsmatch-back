import { Op } from "sequelize";
import UserSport from "../models/UserSport.model";


class UserSportPersistence {
    static async updateUserSports(userId: string, sports: string[]) {
        const transaction = await UserSport.sequelize?.transaction();
        try {
            await UserSport.destroy({ where: { user_id: userId, sport_id: { [Op.notIn]: sports}}, transaction });
            if (sports.length === 0) return [];
            const newSports = await UserSport.bulkCreate(sports.map((sport: string) => ({ user_id: userId, sport_id: sport })), { ignoreDuplicates: true, transaction });
            return newSports;
        } catch (err) {
            await transaction?.rollback();
            throw err;
        } finally {
            await transaction?.commit();
        }
    }
}

export default UserSportPersistence;