import { HTTP_STATUS } from "../constants/http.constants";
import GenericException from "./generic.exception";

export default class NotFoundException extends GenericException {
    constructor(itemName: string) {
        super({
            status: HTTP_STATUS.NOT_FOUND,
            internalStatus: "NOT_FOUND",
            message: `${itemName} not found`,
        });
    }
}