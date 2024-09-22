

export default interface IUserDetailDto {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    email: string;
    rating: {
        rate: number,
        count: number
    };
    sports: number[];
    locations: string[];
}