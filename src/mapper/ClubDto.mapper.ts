import {round} from "../utils/math/math.utils";
import {IClubDetail} from "../database/models/Club.model";
import IClubDto from "../dto/club.dto";


export default class ClubDtoMapper {
    static toClubDto(clubDetail: IClubDetail): IClubDto {
        const clubDto: IClubDto = {
            id: clubDetail.id.toString(),
            name: clubDetail.name,
            phoneNumber: clubDetail.phone_number,
            email: clubDetail.email,
            locations: clubDetail.locations,
        }
        return clubDto;
    }
}