import { IUserDetail } from "../database/models/User.model";
import IUserDetailDto from "../dto/userDetail.dto";
import { round } from "../utils/math/math.utils";


export default class UserDetailDtoMapper {
    static toUserDetailDto(userDetail: IUserDetail): IUserDetailDto {
        const userDetailDto: IUserDetailDto = {
            id: userDetail.user_id.toString(),
            firstName: userDetail.firstname,
            lastName: userDetail.lastname,
            phoneNumber: userDetail.phone_number,
            birthDate: userDetail.birth_date,
            email: userDetail.email,
            imageUrl: userDetail.image_url,
            sports: userDetail.sports,
            locations: userDetail.locations,
            rating: {
                rate: round(userDetail.rating, 2),
                count: userDetail.count
            }
        }
        return userDetailDto;
    }
}