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

const default_radius = 20;

class ClubService {
    private static instance: ClubService;

    static getInstance() {
        if (!ClubService.instance) ClubService.instance = new ClubService();
        return ClubService.instance;
    }

    private constructor() {
    }

    public async getClubs(): Promise<any> {
        return await ClubPersistence.getAllUsers();
    }


    public async createUser(
        email: string,
        name: string,
        phone_number: string,
        transaction: Transaction
    ): Promise<void> {
        await ClubPersistence.createUser({ email, name, phone_number}, transaction);
    }


    public async getClubById(id: string): Promise<any> {
        // Promise<IClubDto>
        // const user = await ClubPersistence.getClubById(id);
        // if (!user) throw new NotFoundException("Club");
        //
        // return ClubDtoMapper.toClubDto(user);
    }


    public async updateClub(userId: string, phoneNumber?: string, location?: string): Promise<void> {
        // if (phoneNumber) await this.updatePhoneNumber(userId, phoneNumber);
        // if (location) await this.updateLocation(userId, location);
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

    public async updateLocation(userId: number, latitude: number, longitude: number, address: string): Promise<void> {
        const newLocation = ClubLocationPersistence.UpdateClubLocation(userId, latitude, longitude, address);
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