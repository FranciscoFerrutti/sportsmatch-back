import { Transaction } from "sequelize";
import Club from "../models/Club.model";
import ClubLocation from "../models/ClubLocation.model";
import geohash from 'ngeohash';

class ClubLocationPersistence {
    static async UpdateClubLocation(
        clubId: string,
        latitude: number,
        longitude: number,
        address: string,
        transaction?: Transaction
    ): Promise<ClubLocation> {

        const geohashString = geohash.encode(latitude, longitude, 8);

        // Find existing club location
        const existingLocation = await ClubLocation.findOne({ where: { clubId } });

        if (existingLocation) {
            // Update existing location
            await existingLocation.update(
                { geohash: geohashString, address, latitude, longitude },
                { transaction }
            );
            return existingLocation;
        } else {
            // Create new location
            const newLocation = await ClubLocation.create(
                { clubId, geohash: geohashString, address, latitude, longitude },
                { transaction }
            );
            return newLocation;
        }
    }
}

export default ClubLocationPersistence;