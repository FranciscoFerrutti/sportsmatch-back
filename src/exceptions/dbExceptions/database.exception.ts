import GenericException from "../generic.exception";


export default class DatabaseException extends GenericException {
    constructor() {
        super({ message: "internal db error", status: 500, internalStatus: "DATABASE"});
    }
}