import { Transaction } from "sequelize";
import Club from "../models/Club.model";
import ClubLocation from "../models/ClubLocation.model";
import geohash from 'ngeohash';
import {LOCATION_COORDINATES} from "../../constants/neighbourhoods.constants";
import { Op, fn, col, where, Sequelize } from "sequelize";



class ClubLocationPersistence {
    static async UpdateClubLocation(
        clubId: number,
        latitude: number,
        longitude: number,
        address: string,
        transaction?: Transaction
    ): Promise<ClubLocation> {

        const geohashString = geohash.encode(latitude, longitude, 8);

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

    static async getNearLocations(location: string, radius: number): Promise<ClubLocation[]> {
        const { latitude, longitude } = LOCATION_COORDINATES[location];
        const userGeohash = geohash.encode(latitude, longitude, 6);
        console.log(location, userGeohash)

        const neighbors = geohash.neighbors(userGeohash);

        const locations = await ClubLocation.findAll({
            where: Sequelize.literal(`substring("ClubLocation"."geohash", 1, 6) IN ('${geohash}', '${neighbors.join("','")}')`)
        });

        const filteredLocations = locations.filter(loc => {
            const distance = this.haversineDistance(
                latitude,
                longitude,
                loc.latitude,
                loc.longitude
            );
            return distance <= radius;
        });

        return filteredLocations;
    }

    private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon
                / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    private static toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

export default ClubLocationPersistence;