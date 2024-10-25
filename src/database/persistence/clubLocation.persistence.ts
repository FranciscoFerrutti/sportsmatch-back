import { Transaction } from "sequelize";
import Club from "../models/Club.model";
import ClubLocation from "../models/ClubLocation.model";
import geohash from 'ngeohash';

class ClubLocationPersistence {
    static async UpdateClubLocation(
        clubId: number,
        latitude: number,
        longitude: number,
        address: string,
        transaction?: Transaction
    ): Promise<ClubLocation> {

        const geohashString = geohash.encode(latitude, longitude, 8);
        console.log(geohashString)

        const existingLocation = await ClubLocation.findOne({ where: { club_id: clubId } });

        if (existingLocation) {
            await existingLocation.update(
                { geohash: geohashString, address, latitude, longitude },
                { transaction }
            );
            return existingLocation;
        } else {
            const newLocation = await ClubLocation.create(
                { club_id: clubId, geohash: geohashString, address, latitude, longitude },
                { transaction }
            );
            return newLocation;
        }
    }

    static async getAllLocations(): Promise<ClubLocation[]>{
        const clubs = await ClubLocation.findAll();
        return clubs;
    }
}

export default ClubLocationPersistence;