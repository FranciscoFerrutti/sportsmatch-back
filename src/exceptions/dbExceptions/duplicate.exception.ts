import { HTTP_STATUS } from "../../constants/http.constants";
import GenericException from "../generic.exception";


export default class DuplicateException extends GenericException {
    constructor(message: string | string[]) {
        if (message instanceof Array) message = message.join(", ");
        super({message, status: HTTP_STATUS.CONFLICT, internalStatus: "DUPLICATE"});
    }
}