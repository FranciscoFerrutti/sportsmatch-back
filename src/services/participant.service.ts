import { HTTP_STATUS } from "../constants/http.constants";
import { IParticipantDetail } from "../database/models/Participant.model";
import EventPersistence from "../database/persistence/event.persistence";
import ParticipantPersistence from "../database/persistence/participant.persistence";
import IParticipantDetailDto from "../dto/participantDetail.dto";
import GenericException from "../exceptions/generic.exception";
import NotFoundException from "../exceptions/notFound.exception";
import ParticipantDetailDtoMapper from "../mapper/participantDetailDto.mapper";
import { round } from "../utils/math/math.utils";
import {OrganizerType} from "../constants/event.constants";

class ParticipantService {
    private static instance: ParticipantService;

    private constructor() {}

    static getInstance() {
        if (!ParticipantService.instance) ParticipantService.instance = new ParticipantService();
        return ParticipantService.instance;
    }

    public async addParticipant(eventId: string, participantId: string): Promise<void> {
        const event = await EventPersistence.getEventById(eventId);
        if (!event) throw new NotFoundException("Event");

        await ParticipantPersistence.createParticipant(eventId.toString(), participantId);
    }

    public async removeParticipant(eventId: string, participantId: string, ownerId?: string, ownerType?: string): Promise<void> {
        if (ownerId) {
            const event = await EventPersistence.getEventById(eventId);
            if (!event) throw new NotFoundException("Event");
            
            if (event.ownerId.toString() !== ownerId || 
                event.organizerType !== (ownerType === 'club' ? OrganizerType.CLUB : OrganizerType.USER)) {
                throw new GenericException({ 
                    message: "User is not the owner of the event", 
                    status: HTTP_STATUS.BAD_REQUEST, 
                    internalStatus: "NOT_OWNER" 
                });
            }
        }
        const removed = await ParticipantPersistence.removeParticipant(eventId.toString(), participantId);
        if (!removed) throw new NotFoundException("Participant");
    }

    public async acceptParticipant(eventId: number, participantId: string, ownerId: string, ownerType: string): Promise<void> {
        const event = await EventPersistence.getEventById(eventId.toString());
        if (!event) throw new NotFoundException("Event");
        
        if (event.ownerId.toString() !== ownerId || 
            event.organizerType !== (ownerType === 'club' ? OrganizerType.CLUB : OrganizerType.USER)) {
            throw new GenericException({ 
                message: "User is not the owner of the event", 
                status: HTTP_STATUS.BAD_REQUEST, 
                internalStatus: "NOT_OWNER" 
            });
        }

        await ParticipantPersistence.updateStatus(eventId.toString(), participantId, true);
    }

    public async getParticipants(eventId: number, status?: boolean): Promise<IParticipantDetailDto[]> {
        const participants = await ParticipantPersistence.getParticipantsDetailsByEventId(eventId.toString());

        const participantsDtos: IParticipantDetailDto[] = participants.map((p: IParticipantDetail) => {
            return ParticipantDetailDtoMapper.toParticipantDetailDto(p);
        });

        if (status !== undefined) {
            return participantsDtos.filter((p: IParticipantDetailDto) => p.participantStatus === status);
        }

        return participantsDtos;
    }

    public async existParticipant(eventId: string, participantId: string): Promise<boolean>{
        return await ParticipantPersistence.getParticipant(eventId, participantId);
    }
}

export default ParticipantService;