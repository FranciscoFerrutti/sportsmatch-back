import GenericException from "../exceptions/generic.exception";
import ClubPersistence from "../database/persistence/club.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import { Transaction, ValidationErrorItem } from "sequelize";
import { HTTP_STATUS } from "../constants/http.constants";

class ClubService {
    private static instance: ClubService;

    static getInstance() {
        if (!ClubService.instance) ClubService.instance = new ClubService();
        return ClubService.instance;
    }

    private constructor() {
    }

    // public async getUsers(): Promise<any> {
    //     return await UserPersistence.getAllUsers();
    // }


    public async createUser(
        email: string,
        name: string,
        phone_number: string,
        transaction: Transaction
    ): Promise<void> {
        await ClubPersistence.createUser({ email, name, phone_number}, transaction);
    }

    // private async updateLocations(userId: string, locations: string[]): Promise<void> {
    //     const newLocations = UserLocationPersistence.updateUserLocations(userId, locations);
    // }
}

export default ClubService;