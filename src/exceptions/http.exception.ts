import { AxiosResponse } from 'axios';

export default class HttpException extends Error {
    status: number;
    internalStatus: string;
    message: string;
    response?: AxiosResponse;

    constructor(status: number, internalStatus: string, message: string) {
        super(message);
        this.status = status;
        this.internalStatus = internalStatus;
        this.message = message;
    }
}
