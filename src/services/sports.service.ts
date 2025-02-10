import Sport from "../database/models/Sport.model";
import NotFoundException from "../exceptions/notFound.exception";

class SportsService {
    private static instance: SportsService;

    private constructor() {}

    public static getInstance(): SportsService {
        if (!this.instance) {
            this.instance = new SportsService();
        }
        return this.instance;
    }

    public async getSports(): Promise<Sport[]> {
        const sports = await Sport.findAll();
        if (!sports || sports.length === 0) {
            throw new NotFoundException("No sports found");
        }
        return sports;
    }
}

export default SportsService;
