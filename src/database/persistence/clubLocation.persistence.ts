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
        locality: string,
        transaction?: Transaction
    ): Promise<ClubLocation> {

        const geohashString = geohash.encode(latitude, longitude, 8);

        const existingLocation = await ClubLocation.findOne({ where: { club_id: clubId } });

        if (existingLocation) {
            await existingLocation.update(
                { geohash: geohashString, address, latitude, longitude, locality },
                { transaction }
            );
            return existingLocation;
        } else {
            const newLocation = await ClubLocation.create(
                { club_id: clubId, geohash: geohashString, address, latitude, longitude, locality },
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
        
        // Calculate the bounding box for the given radius
        const kmPerLat = 111.32; // Approximate km per degree of latitude
        const kmPerLon = Math.cos(this.toRadians(latitude)) * 111.32;
        
        const latChange = radius / kmPerLat;
        const lonChange = radius / kmPerLon;
        
        const minLat = latitude - latChange;
        const maxLat = latitude + latChange;
        const minLon = longitude - lonChange;
        const maxLon = longitude + lonChange;

        // Get all locations within the bounding box
        const locations = await ClubLocation.findAll({
            where: {
                latitude: {
                    [Op.between]: [minLat, maxLat]
                },
                longitude: {
                    [Op.between]: [minLon, maxLon]
                }
            },
            include: [{
                model: Club,
                required: true
            }]
        });

        // Filter locations by exact distance using haversine formula
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