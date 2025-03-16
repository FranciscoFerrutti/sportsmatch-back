import User from "../models/User.model";

class UserImagePersistence {
    static async updateUserImage(userId: string, imageUrl: string) {
        const transaction = await User.sequelize?.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (!user) throw new Error("User not found");

            user.image_url = imageUrl;
            await user.save({ transaction });

            return user;
        } catch (err) {
            await transaction?.rollback();
            throw err;
        } finally {
            await transaction?.commit();
        }
    }
}

export default UserImagePersistence;
