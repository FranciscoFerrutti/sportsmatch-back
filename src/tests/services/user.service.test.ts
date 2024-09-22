import EventPersistence from "../../database/persistence/event.persistence";
import RatingPersistence from "../../database/persistence/rating.persistence";
import UserPersistence from "../../database/persistence/user.persistence";
import UserLocationPersistence from "../../database/persistence/userLocation.persistence";
import UserSportPersistence from "../../database/persistence/userSport.persistense";
import GenericException from "../../exceptions/generic.exception";
import UsersService from "../../services/user.service";
import { expect, jest} from "@jest/globals";

jest.mock("../../database/persistence/user.persistence");
jest.mock("../../database/persistence/rating.persistence");
jest.mock("../../database/persistence/event.persistence");
jest.mock("../../database/persistence/userLocation.persistence");
jest.mock("../../database/persistence/userSport.persistense");

const fakeUser = {
    user_id: 1,
    firstname: "Gaston",
    lastname: "De Schant",
    phone_number: "+5492235910125",
    email: "gdeschant@itba.edu.ar"
}

const fullUser = {
    user_id: fakeUser.user_id,
    firstname: fakeUser.firstname,
    lastname: fakeUser.lastname,
    phone_number: fakeUser.phone_number,
    email: fakeUser.email,
    sports: ["1","2"],
    locations: ["Toronto", "Belgrano"],
    rating: 5,
    count: 1
}

describe("User Service test", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    describe("get users", () => {
        it("should return a valid instance of userService", () => {
            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();
        });

        it("get user by email", async () => {
            UserPersistence.getUserDetailById.mockResolvedValueOnce(fullUser);

            const userService = UsersService.getInstance();
            
            const user = await userService.getUserDetailById(fullUser.user_id);
            expect(user).toBeDefined();
            expect(user).toEqual(fullUser);
        });

        it("get users", async () => {
            UserPersistence.getAllUsers.mockResolvedValue(
                [fakeUser]
            );

            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();

            const users = await userService.getUsers();
            expect(users).toBeDefined();
            expect(users).toEqual([fakeUser]);
        });
    });

    describe("rateUser", () => {
        it("should successfully rate a user", async () => {
            // Mock the RatingPersistence rate function to return a successful response
            RatingPersistence.rate.mockResolvedValueOnce();
            EventPersistence.getEventByIdWithParticipants.mockResolvedValueOnce({
                schedule: new Date(2023, 9, 30, 10, 0), // Event in the future
                duration: 60, // Event duration in minutes
                participants: [
                    { userId: 1 },
                ],
                ownerId: 2,
            });
    
            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();
    
            // Call the rateUser function with valid input
            await userService.rateUser("1", "2", 5, "3");
    
            // You can add assertions here to ensure the function behaves as expected
            expect(RatingPersistence.rate).toHaveBeenCalledWith("1", "2", 5, "3");
        });
    
        it("should throw an error when a user tries to rate themselves", async () => {
            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();
    
            // Call the rateUser function with the same rated and rater user
            await expect(userService.rateUser("1", "1", 5, "3")).rejects.toThrowError(
                new GenericException({ message: "User can't rate himself", status: 400, internalStatus: "BAD_REQUEST" })
            );
        });
    
        it("should throw an error when the event is not found", async () => {
            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();
    
            // Mock the EventPersistence.getEventByIdWithParticipants function to return null
            EventPersistence.getEventByIdWithParticipants.mockResolvedValueOnce(null);
    
            // Call the rateUser function with an invalid eventId
            await expect(userService.rateUser("1", "2", 5, "invalid_event_id")).rejects.toThrowError(
                new GenericException({ message: "Event not found", status: 404, internalStatus: "NOT_FOUND" })
            );
        });
    
        it("should throw an error when the event is not rateable", async () => {
            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();
    
            // Mock the EventPersistence.getEventByIdWithParticipants function to return an event that is not rateable
            EventPersistence.getEventByIdWithParticipants.mockResolvedValueOnce({
                schedule: new Date(2023, 10, 30, 10, 0), // Event in the future
                duration: 60, // Event duration in minutes
            });
    
            // Call the rateUser function with an event that is not rateable
            await expect(userService.rateUser("1", "2", 5, "3")).rejects.toThrowError(
                new GenericException({ message: "Event is not rateable", status: 400, internalStatus: "BAD_REQUEST" })
            );
        });
    });

    describe("update user", () => {
        it("update all fields", async () => { // TODO: this should be tested more on the mocked db than the service
            UserPersistence.updatePhoneNumber.mockResolvedValueOnce(fakeUser);
            UserLocationPersistence.updateUserLocations.mockResolvedValueOnce(null);
            UserSportPersistence.updateUserSports.mockResolvedValueOnce(null);

            const userService = UsersService.getInstance();
            expect(userService).toBeDefined();

            await userService.updateUser("1", "gdeschant@itba.edu.ar", "+5492235910124", ["Toronto", "Belgrano"], ["1","2"]); 
        });
    });    
})
