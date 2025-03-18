

export default interface IParticipantDetailDto {
    userId: string;
    firstname: string;
    lastname: string;
    email: string;
    participantStatus: boolean;
    phoneNumber: string;
    imageUrl: string;
    rating: {
        rate: number,
        count: number
    };
    isRated: boolean;
}