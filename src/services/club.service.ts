import GenericException from "../exceptions/generic.exception";
import ClubPersistence from "../database/persistence/club.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import { Transaction, ValidationErrorItem } from "sequelize";
import { HTTP_STATUS } from "../constants/http.constants";
import ClubDtoMapper from "../mapper/ClubDto.mapper";
import IClubDto from "../dto/club.dto";
import User from "../database/models/User.model";
import UserLocationPersistence from "../database/persistence/userLocation.persistence";
import ClubLocationPersistence from "../database/persistence/clubLocation.persistence";
import Club from "../database/models/Club.model";

const default_radius = 5;

class ClubService {
    private static instance: ClubService;

    static getInstance() {
        if (!ClubService.instance) ClubService.instance = new ClubService();
        return ClubService.instance;
    }

    private constructor() {
    }

    public async getClubs(): Promise<any> {
        return await ClubPersistence.getAllClubs();
    }


    public async createUser(
        email: string,
        name: string,
        phone_number: string,
        description: string,
        transaction: Transaction
    ): Promise<void> {
        await ClubPersistence.createClub({ email, name, phone_number, description}, transaction);
    }


    public async getClubById(id: string): Promise<any> {
        console.log("🔍 Buscando club con ID:", id);

        const club = await ClubPersistence.getClubById(id);

        if (!club) {
            console.warn("⚠️ Club no encontrado con ID:", id);
            throw new Error("Club no encontrado");
        }

        const clubData = club.toJSON() as any;
        const location= club.location?.locality;

        const response = {
            ...clubData,
            location
        };

        return response;
    }



    public async updateClub(userId: string, phoneNumber?: string, description?: string, imageUrl?: string): Promise<void> {
        try {
            const club = await ClubPersistence.getClubById(userId);
            if (!club) {
                console.error(`❌ No se encontró el club con ID: ${userId}`);
                throw new Error("Club no encontrado.");
            }
            const updateFields: Partial<Club> = {};
            if (description !== undefined) updateFields.description = description;
            if (imageUrl !== undefined) updateFields.image_url = imageUrl;
            if (phoneNumber !== undefined) updateFields.phone_number = phoneNumber;
            // if (location) await this.updateLocation(userId, location);
            await ClubPersistence.updateClub(userId, updateFields);
            console.log("✅ Club actualizado correctamente:", updateFields);
        } catch (error) {
            console.error("❌ Error al actualizar club:", error);
            throw new Error("Error al actualizar club.");
        }
    }

    // private async updatePhoneNumber(userId: string, phone_number: string): Promise<User> {
    // try {
    //     const updatedUser = await UserPersistence.updatePhoneNumber(+userId, phone_number);
    //
    //     return updatedUser;
    // } catch (err) {
    //     if (err.errors && err.errors[0]) {
    //         const error = err.errors[0] as ValidationErrorItem;
    //         if (error.type == 'unique violation') {
    //             throw new GenericException({status: HTTP_STATUS.CONFLICT, message: `phoneNumber`, internalStatus: "CONFLICT"});
    //         }
    //         throw new GenericException({status: HTTP_STATUS.BAD_REQUEST, message: error.message, internalStatus: "VALIDATION_ERROR"});
    //     }
    //     throw err;
    // }
    // }

    public async updateLocation(userId: number, latitude: number, longitude: number, address: string, locality: string): Promise<void> {
        const newLocation = ClubLocationPersistence.UpdateClubLocation(userId, latitude, longitude, address, locality);
    }

    public async getLocs(): Promise<any> {
        return await ClubLocationPersistence.getAllLocations();
    }

    public async getNearClubs(location: string, radius?: number): Promise<any> {
        if(radius)
            return await ClubLocationPersistence.getNearLocations(location, radius);
        return await ClubLocationPersistence.getNearLocations(location, default_radius);
    }

}

export default ClubService;