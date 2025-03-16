import GenericException from "../exceptions/generic.exception";
import UserPersistence from "../database/persistence/user.persistence";
import User from "../database/models/User.model";
import UserLocationPersistence from "../database/persistence/userLocation.persistence";
import UserSportPersistence from "../database/persistence/userSport.persistense";
import RatingPersistence from "../database/persistence/rating.persistence";
import EventPersistence from "../database/persistence/event.persistence";
import NotFoundException from "../exceptions/notFound.exception";
import { Transaction, ValidationErrorItem } from "sequelize";
import { HTTP_STATUS } from "../constants/http.constants";
import IUserDetailDto from "../dto/userDetail.dto";
import UserDetailDtoMapper from "../mapper/userDetailDto.mapper";
import UserImagePersistence from "../database/persistence/userImage.persistence";


class UsersService {
    private static instance: UsersService;

    static getInstance() {
        if (!UsersService.instance) UsersService.instance = new UsersService();
        return UsersService.instance;
    }

    private constructor() {
    }

    public async getUsers(): Promise<any> {
        return await UserPersistence.getAllUsers();
    }

    public async getUserDetailById(id: string): Promise<IUserDetailDto> {
        const user = await UserPersistence.getUserDetailById(id);
        if (!user) throw new NotFoundException("User");

        return UserDetailDtoMapper.toUserDetailDto(user);
    }

    public async rateUser(rated: string, rater: string, rating: number, eventId: string): Promise<void> {
        try {
            const event = await EventPersistence.getEventByIdWithParticipants(eventId);
            if (!event) throw new NotFoundException("Event");
            if (event.schedule.getTime() + event.duration * 60000 > Date.now()) throw new GenericException({ message: "Event is not rateable", status: HTTP_STATUS.BAD_REQUEST, internalStatus: "BAD_REQUEST"});

            // check that user can rate
            if ((event.participants.filter((participant) => participant.userId === +rated ||
              participant.userId === +rater).length + ((event.ownerId === +rated || event.ownerId === +rater) ? 1 : 0)) !== 2)
                throw new GenericException({ message: "User can't rate this event", status: HTTP_STATUS.BAD_REQUEST, internalStatus: "BAD_REQUEST"});

            await RatingPersistence.rate(rated, rater, rating, eventId);
        } catch (err) {
            if (err instanceof GenericException) throw err;
            throw new GenericException({ message: "Internal server error", status: 500, internalStatus: "INTERNAL_SERVER_ERROR"});
        }
      }
      

    public async createUser(
        email: string,
        firstname: string,
        lastname: string,
        phone_number: string,
        birthdate: string,
        transaction: Transaction
    ): Promise<void> {
        await UserPersistence.createUser({ email, firstname, lastname, phone_number, birthdate}, transaction);
    }

    public async updateUser(userId: string, phoneNumber?: string, locations?: string[], sports?: string[], imageUrl?: string): Promise<void> {
        if (phoneNumber) await this.updatePhoneNumber(userId, phoneNumber);
        if (locations) await this.updateLocations(userId, locations);
        if (sports) await this.updateSports(userId, sports);
        if (imageUrl) await this.updateImageUrl(userId, imageUrl);
    }

    private async updatePhoneNumber(userId: string, phone_number: string): Promise<User> {
        try {
            const updatedUser = await UserPersistence.updatePhoneNumber(+userId, phone_number);        

            return updatedUser;
        } catch (err) {
            if (err.errors && err.errors[0]) {
                const error = err.errors[0] as ValidationErrorItem;
                if (error.type == 'unique violation') {
                    throw new GenericException({status: HTTP_STATUS.CONFLICT, message: `phoneNumber`, internalStatus: "CONFLICT"});
                }
                throw new GenericException({status: HTTP_STATUS.BAD_REQUEST, message: error.message, internalStatus: "VALIDATION_ERROR"});
            }
            throw err;
        }
    }

    private async updateLocations(userId: string, locations: string[]): Promise<void> {
        const newLocations = UserLocationPersistence.updateUserLocations(userId, locations);
    }

    private async updateSports(userId: string, sports: string[]): Promise<void> {
        const newSports = await UserSportPersistence.updateUserSports(userId, sports);
    }

    private async updateImageUrl(userId: string, imageUrl: string): Promise<void> {
        await UserImagePersistence.updateUserImage(userId, imageUrl);
    }

}

export default UsersService;