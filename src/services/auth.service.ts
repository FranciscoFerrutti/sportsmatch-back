import UsersService from "./user.service";
import sequelize from "../database/connection";
import AuthPersistence from "../database/persistence/auth.persistence";
import * as jwt from 'jsonwebtoken';
import Crypto from "crypto";
import GenericException from "../exceptions/generic.exception";
import NotFoundException from "../exceptions/notFound.exception";
import Bluebird from "bluebird";
import UserPersistence from "../database/persistence/user.persistence";
import { ValidationErrorItem } from "sequelize";
import { HTTP_STATUS } from "../constants/http.constants";
import UserDetailDtoMapper from "../mapper/userDetailDto.mapper";
import { SignOptions } from 'jsonwebtoken';

class AuthService {
    private static instance: AuthService;
    private userService: UsersService;
    private readonly jwtKey: string;
    private readonly accessTokenExpireTime: string;

    static getInstance() {
        if (!AuthService.instance) AuthService.instance = new AuthService();
        return AuthService.instance;
    }

    private constructor() {
        this.accessTokenExpireTime = (process.env.ACCESS_TOKEN_EXPIRE_TIME ?? '12h') as `${number}${'s' | 'm' | 'h' | 'd'}`;
        this.jwtKey = process.env.JWT_KEY ?? "kvajfvhjabdsjhvajdhvjsvbsmn";
        this.userService = UsersService.getInstance();
    }

    async createAuth(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, birthdate: string) {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const passwordHash = await hashPassword(password);

            await AuthPersistence.createAuth(email, passwordHash.toString(), transaction);

            await this.userService.createUser(email, firstName, lastName, phoneNumber, birthdate, transaction);

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
        const userAuth = await AuthPersistence.getAuthByEmail(email);
        if (!userAuth) throw new NotFoundException('User');

        if (!await validatePassword(password, userAuth.password!)) throw new NotFoundException('User');

        const user = await UserPersistence.getUserByEmail(email);
        if (!user) throw new NotFoundException('User');
        const userDetail = await UserPersistence.getUserDetailById(user.id.toString());
        if (!userDetail) throw new NotFoundException('User');

        const accessToken = this.signAccessToken(user.id.toString(), userAuth.email);
        
        return {userDetail: UserDetailDtoMapper.toUserDetailDto(userDetail), accessToken};
    }

    verifyToken = async (token: string): Promise<{email: string, id: string, type: string}> => {
        try {
            const pubKey = this.jwtKey;
            const decoded = jwt.verify(token, pubKey) as {email: string, id: string, type: string};
            
            if (decoded.type !== 'user') {
                throw {status: HTTP_STATUS.FORBIDDEN, message: "Access forbidden: Not a valid user token"};
            }
            
            const user = await UserPersistence.getUserById(decoded.id);
            if (!user) {
                throw {status: HTTP_STATUS.FORBIDDEN, message: "Access forbidden: User not found"};
            }
            
            return decoded;
        } catch(err) {
            const error = err as any;
            if(error.name == 'TokenExpiredError') {
                throw {status: HTTP_STATUS.UNAUTHORIZED, message: "Expired token."};
            } else if (error.status) {
                throw error;
            } else {
                throw {status: HTTP_STATUS.BAD_REQUEST, message: "Invalid token."};
            }
        }
    }

    private signAccessToken = (userId: string, email: string) : string => {
        return this.jwtSign(userId, email, this.accessTokenExpireTime);
    }

    private jwtSign = (userId: string, email: string, expiryTime: string) => {
        const payload = { id: userId, email: email, type: "user" };

        // Verifica que la clave no sea nula o vacía
        if (!this.jwtKey || typeof this.jwtKey !== "string" || this.jwtKey.trim() === "") {
            throw new Error("JWT_KEY is missing or invalid");
        }

        const options: SignOptions = {
            issuer: 'byPS',
            expiresIn: expiryTime
        };

        return jwt.sign(payload, this.jwtKey, options);
    };

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

export default AuthService;