import { IErrorData } from '../interfaces/error.interface';
import HttpException from './http.exception';

export default class GenericException extends HttpException {
    constructor(error: IErrorData) {
        super(error.status, error.internalStatus, error.message);
    }
}
