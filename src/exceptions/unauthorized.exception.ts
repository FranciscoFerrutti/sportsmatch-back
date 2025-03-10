import { HTTP_STATUS } from "../constants/http.constants";
import GenericException from "./generic.exception";

export default class UnauthorizedException extends GenericException {
    constructor(message: string) {
        super({
            status: HTTP_STATUS.UNAUTHORIZED,
            internalStatus: "UNAUTHORIZED",
            message: message,
        });
    }
} 