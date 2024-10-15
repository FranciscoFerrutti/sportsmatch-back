import sequelize from "../database/connection";
import ClubAuthPersistence from "../database/persistence/clubAuth.persistence";
import {ValidationErrorItem} from "sequelize";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import NotFoundException from "../exceptions/notFound.exception";
import ClubPersistence from "../database/persistence/club.persistence";
import UserDetailDtoMapper from "../mapper/userDetailDto.mapper";
import * as jwt from "jsonwebtoken";
import Bluebird from "bluebird";
import Crypto from "crypto";
import ClubService from "./club.service";

class ClubAuthService {
    private static instance: ClubAuthService;
    private clubService: ClubService;
    private readonly jwtKey: string;
    private readonly accessTokenExpireTime: string;

    static getInstance() {
        if (!ClubAuthService.instance) ClubAuthService.instance = new ClubAuthService();
        return ClubAuthService.instance;
    }

    private constructor() {
        this.accessTokenExpireTime = process.env.ACCESS_TOKEN_EXPIRE_TIME ?? '7600000';
        this.jwtKey = process.env.JWT_KEY ?? 'kvajfvhjabdsjhvajdhvjsvbsmn';
        this.clubService = ClubService.getInstance();
    }

    async createAuth(email: string, password: string, clubName: string, phoneNumber: string) {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const passwordHash = await hashPassword(password);

            await ClubAuthPersistence.createAuth(email, passwordHash.toString(), transaction);

            await this.clubService.createUser(email, clubName, phoneNumber, transaction);

            await transaction.commit();
        } catch (err) {
            if (transaction) await transaction.rollback();
            if (err.errors && err.errors[0]) {
                const error = err.errors[0] as ValidationErrorItem;
                if (error.type == 'unique violation') {
                    throw new GenericException({status: HTTP_STATUS.CONFLICT, message: `${error.path}`, internalStatus: "CONFLICT"});
                }
                throw new GenericException({status: HTTP_STATUS.BAD_REQUEST, message: error.message, internalStatus: "VALIDATION_ERROR"});
            }
            throw err;
        }
    }

    login = async (email: string, password: string) => {
        const userAuth = await ClubAuthPersistence.getAuthByEmail(email);
        if (!userAuth) throw new NotFoundException('User');

        if (!await validatePassword(password, userAuth.password!)) throw new NotFoundException('User');

        const user = await ClubPersistence.getUserByEmail(email);
        if (!user) throw new NotFoundException('User');
        // const userDetail = await UserPersistence.getUserDetailById(user.id.toString());
        // if (!userDetail) throw new NotFoundException('User');

        const accessToken = this.signAccessToken(user.id.toString(), userAuth.email);

        return accessToken;
    }

    verifyToken = (token: string) : string | jwt.JwtPayload=> {

        try{
            const pubKey = this.jwtKey;
            return jwt.verify(token, pubKey);
        } catch(err){
            const error = err as any;
            if(error.name == 'TokenExpiredError') {
                throw {status: HTTP_STATUS.UNAUTHORIZED, message: "Expired token."};
            } else {
                throw {status: HTTP_STATUS.BAD_REQUEST, message: "Invalid token."};
            }
        }
    }

    private signAccessToken = (userId: string, email: string) : string => {
        return this.jwtSign(userId, email, this.accessTokenExpireTime);
    }

    private jwtSign = (userId: string, email: string, expiryTime: string) => {
        const payload = {id: userId, email: email};
        const key = this.jwtKey;
        return jwt.sign(payload, key, {issuer: 'byPS', expiresIn: expiryTime });
    }
}

export const pbkdf2 = Bluebird.promisify(Crypto.pbkdf2);
export const PBKDF2_HASH = process.env.PBKDF2_HASH ?? '';

export const validatePassword = async (maybePassword: string, passwordHash: string) => {
    const derKey: Buffer = await pbkdf2(maybePassword, PBKDF2_HASH, 1000, 32, 'sha512');
    return derKey.toString() === passwordHash;
};

export const hashPassword = async (password: string) => {
    return pbkdf2(password, PBKDF2_HASH, 1000, 32, 'sha512');
}

export default ClubAuthService;