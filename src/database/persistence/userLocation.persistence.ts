import { Op } from "sequelize";
import User from "../models/User.model";
import UserLocation from "../models/UserLocation.model";


class UserLocationPersistence {
    static async updateUserLocations(userId: string, locations: string[]) {
        const transaction = await UserLocation.sequelize?.transaction();
        try {
            await UserLocation.destroy({ where: { user_id: userId, location: { [Op.notIn]: locations}}, transaction });
            if (locations.length === 0) return [];
            const newLocations = await UserLocation.bulkCreate(locations.map((location: string) => ({ user_id: userId, location: location })), { ignoreDuplicates: true, transaction });
            return newLocations;
        } catch (err) {
            await transaction?.rollback();
            throw err;
        } finally {
            await transaction?.commit();
        }
    }
}

export default UserLocationPersistence;