import { IParticipantDetail } from "../database/models/Participant.model";
import IParticipantDetailDto from "../dto/participantDetail.dto";
import { round } from "../utils/math/math.utils";


export default class ParticipantDetailDtoMapper {
    static toParticipantDetailDto(p: IParticipantDetail): IParticipantDetailDto {
        const participantDetailDto: IParticipantDetailDto = {
            userId: p.user_id.toString(),
            firstname: p.firstname,
            lastname: p.lastname,
            email: p.email,
            participantStatus: p.participant_status,
            phoneNumber: p.phone_number,
            rating: {
                rate: round(p.rating, 2),
                count: p.count
            },
            isRated: p.is_rated
        }
        return participantDetailDto;
    }
}