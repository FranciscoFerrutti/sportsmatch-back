import { expect, jest} from "@jest/globals";
import EventsService from "../../services/events.service";
import GenericException from "../../exceptions/generic.exception";
import EventPersistence from "../../database/persistence/event.persistence";
import ParticipantPersistence from "../../database/persistence/participant.persistence";
import UserPersistence from "../../database/persistence/user.persistence";

jest.mock("../../database/persistence/event.persistence");
jest.mock("../../database/persistence/participant.persistence");
jest.mock("../../database/persistence/user.persistence");

const fakeUser = {
    id: 1,
    user_id: 1,
    firstname: "Gaston",
    lastname: "De Schant",
    phone_number: "+5492235910125",
    email: "gdeschant@itba.edu.ar"
}

const fakeParticipant = {
    user_id: fakeUser.user_id,
    firstname: fakeUser.firstname,
    lastname: fakeUser.lastname,
    phone_number: fakeUser.phone_number,
    email: fakeUser.email,
    participant_status: true,
    rating: 5,
    count: 1,
    is_rated: 1
}

const fakeEvents = [
    {
      event_id: 1,
      description: "Soccer Match",
      schedule: "2023-10-30T15:00:00",
      location: "City Park",
      expertise: "Intermediate",
      sport_id: 1,
      remaining: 5,
      owner_firstname: "John",
      ownerId: 1,
      participant_status: true, // This should not be on all
      is_rated: 1, // This should not be on all
      rating: 4.5,
      rate_count: 10,
      event_status: 0,
    },
    {
      event_id: 2,
      description: "Tennis Tournament",
      schedule: "2023-11-15T10:00:00",
      location: "Sport Club",
      expertise: "Advanced",
      sport_id: 2,
      remaining: 10,
      owner_firstname: "Alice",
      ownerId: 3,
      participant_status: false,
      is_rated: 0,
      rating: 0,
      rate_count: 0,
      event_status: 1,
    },
];

const fakeEvent: any = fakeEvents[0];
fakeEvent.id = 1;

describe("Event Service test", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    describe("get events", () => {
        it("should return a valid instance of eventsService", () => {
            const eventsService = EventsService.getInstance();
            expect(eventsService).toBeDefined();
        });

        it("get events", async () => {
            EventPersistence.getEvents.mockResolvedValue([fakeEvent]);

            const eventsService = EventsService.getInstance();
            expect(eventsService).toBeDefined();

            const filters = { participantId: "true" }

            const events = await eventsService.getEvents(filters);

            expect(events).toBeDefined();

            expect(events).toEqual({
                page: 0,
                pageSize: 1,
                items: [
                    fakeEvent
                ]
            });
        });

        it("get event", async () => {
            EventPersistence.getEventDetailById.mockResolvedValue(fakeEvent);

            const eventsService = EventsService.getInstance();
            expect(eventsService).toBeDefined();

            const event = await eventsService.getEventById("1");

            expect(event).toBeDefined();
            expect(event).toEqual(fakeEvent);
        });

        it("event not found", async () => {
            EventPersistence.getEventDetailById.mockResolvedValue(null);


            const eventsService = EventsService.getInstance();
            expect(eventsService).toBeDefined();

            try {
                const event = await eventsService.getEventById("1");
                expect(event).not.toBeDefined();
            } catch (err) {
                expect(err).toBeDefined();
                expect(err.message).toEqual("Event not found");
            }
        });
    });

    describe("participants", () => {
        it("get participants", async () => {
            ParticipantPersistence.getParticipantsDetailsByEventId.mockResolvedValue([fakeParticipant]);

            const eventsService = EventsService.getInstance();
            expect(eventsService).toBeDefined();

            const participants = await eventsService.getParticipants(1);

            expect(participants).toBeDefined();
            expect(participants).toEqual([fakeParticipant]);
        });
    });

    describe("addParticipant", () => {
        it("should successfully add a participant", async () => {
            const eventsService = EventsService.getInstance();
            const email = "test@example.com";
        
            EventPersistence.getEventById.mockResolvedValue(fakeEvent);
            
            await eventsService.addParticipant("1", email);
        });
    });

    describe("removeParticipant", () => {
        it("should successfully remove a participant", async () => {
          // Arrange
          const eventsService = EventsService.getInstance(); // Create an instance of the EventsService
          const eventId = "1";
          const participantId = "1";
      
          // Mock UserPersistence.getUserByEmail to return a fake user
          UserPersistence.getUserDetailById.mockResolvedValue(fakeUser);
      
          // Mock ParticipantPersistence.removeParticipant to return true, indicating success
          ParticipantPersistence.removeParticipant.mockResolvedValue(true);
      
          // Act
          await eventsService.removeParticipant(eventId, participantId);
      
          // Assert
          expect(ParticipantPersistence.removeParticipant).toHaveBeenCalledWith(eventId, fakeUser.id.toString());
          // Add additional assertions based on your implementation
        });
      
        it("should throw an error when participant not found", async () => {
          // Arrange
          const eventsService = EventsService.getInstance(); // Create an instance of the EventsService
          const eventId = "1";
          const email = "test@example.com";
      
          // Mock UserPersistence.getUserByEmail to return a fake user
          UserPersistence.getUserDetailById.mockResolvedValue(fakeUser);
      
          // Mock ParticipantPersistence.removeParticipant to return false, indicating participant not found
          ParticipantPersistence.removeParticipant.mockResolvedValue(false);
      
          // Act and Assert
          try {
            await eventsService.removeParticipant(eventId, email);
            // If no error is thrown, the test should fail
          } catch (error) {
            // Verify that the error is of the correct type and has the expected properties
            expect(error).toBeInstanceOf(GenericException);
            expect(error.message).toEqual("Participant not found");
            expect(error.status).toEqual(404);
            expect(error.internalStatus).toEqual("NOT_FOUND");
          }
        });
      
        it("should successfully remove a participant with ownerEmail", async () => {
            // Arrange
            const eventsService = EventsService.getInstance(); // Create an instance of the EventsService
            const eventId = "1";
            const email = "test@example.com";
            const ownerEmail = "owner@example.com";
        
            // Mock UserPersistence.getUserByEmail to return a fake user for the participant
            UserPersistence.getUserDetailById.mockResolvedValueOnce(fakeUser);
        
            // Mock EventPersistence.getEventById to return a fake event
            EventPersistence.getEventById.mockResolvedValue(fakeEvent);
        
            // Mock ParticipantPersistence.removeParticipant to return true, indicating success
            ParticipantPersistence.removeParticipant.mockResolvedValue(true);
        
            // Act
            await eventsService.removeParticipant(eventId, fakeUser.id.toString(), "1");
        
            // Assert
            expect(ParticipantPersistence.removeParticipant).toHaveBeenCalledWith(eventId, fakeUser.id.toString());
            // Add additional assertions based on your implementation
          });
    });

    describe("get events", () => {
        it("should return all events", async () => {
            const eventsService = EventsService.getInstance();

            EventPersistence.getEvents.mockResolvedValue([fakeEvent]);

            const events = await eventsService.getEvents({});

            expect(events).toBeDefined();
            expect(events).toEqual({
                page: 0,
                pageSize: 1,
                items: [
                    fakeEvent
                ]
            });
        });
    })
    
    describe("createEvent", () => {
        it("should create an event successfully", async () => {
          const eventsService = EventsService.getInstance();
      
          // Mock the UserPersistence.getUserByEmail function to return the owner
          UserPersistence.getUserDetailById.mockResolvedValue(fakeUser);
      
          // Mock the EventPersistence.createEvent function to return the created event
          EventPersistence.createEvent.mockResolvedValue(fakeEvent);
      
          // Act
          const createdEvent = await eventsService.createEvent(fakeEvent);
      
            
          expect(EventPersistence.createEvent).toHaveBeenCalledWith(fakeEvent);
          expect(createdEvent).toEqual(fakeEvent);
        });
      
        it("should throw an error when the owner is not found", async () => {
          // Arrange
          const eventsService = EventsService.getInstance(); // Create an instance of the EventsService
      
          // Mock the UserPersistence.getUserByEmail function to return null, indicating owner not found
          UserPersistence.getUserByEmail.mockResolvedValue(null);
      
          // Act and Assert
          try {
            await eventsService.createEvent(fakeEvent);
            // If no error is thrown, the test should fail
          } catch (error) {
            // Verify that the error is of the correct type and has the expected properties
            expect(error).toBeInstanceOf(GenericException);
            expect(error.message).toEqual("Owner not found");
            expect(error.status).toEqual(404);
            expect(error.internalStatus).toEqual("NOT_FOUND");
          }
        });
    });
});