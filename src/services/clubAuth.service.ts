import sequelize from "../database/connection";
import ClubAuthPersistence from "../database/persistence/clubAuth.persistence";
import {ValidationErrorItem} from "sequelize";
import GenericException from "../exceptions/generic.exception";
import {HTTP_STATUS} from "../constants/http.constants";
import NotFoundException from "../exceptions/notFound.exception";
import ClubPersistence from "../database/persistence/club.persistence";
import * as jwt from "jsonwebtoken";
import Bluebird from "bluebird";
import Crypto from "crypto";
import ClubService from "./club.service";
import { MailService } from "./mail.service";

class ClubAuthService {
    private static instance: ClubAuthService;
    private clubService: ClubService;
    private readonly jwtKey: string;
    private readonly accessTokenExpireTime: string;
    private readonly FRONTEND_URI: string;

    static getInstance() {
        if (!ClubAuthService.instance) ClubAuthService.instance = new ClubAuthService();
        return ClubAuthService.instance;
    }

    private constructor() {
        this.accessTokenExpireTime = process.env.ACCESS_TOKEN_EXPIRE_TIME ?? '7600000';
        this.jwtKey = process.env.JWT_KEY ?? 'kvajfvhjabdsjhvajdhvjsvbsmn';
        this.clubService = ClubService.getInstance();
        this.FRONTEND_URI = process.env.FRONTEND_URI || "https://your-frontend-url.com";
    }

    private generateVerificationToken(): string {
        return Crypto.randomBytes(32).toString('hex');
    }

    async createAuth(email: string, password: string, clubName: string, phoneNumber: string, description: string) {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const passwordHash = await hashPassword(password);
            const verificationToken = this.generateVerificationToken();

            await ClubAuthPersistence.createAuth(email, passwordHash.toString(), verificationToken, transaction);
            await this.clubService.createUser(email, clubName, phoneNumber, description, transaction);

            await MailService.sendClubEmailVerification(email, clubName, verificationToken);

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

    async verifyEmail(token: string): Promise<boolean> {
        const auth = await ClubAuthPersistence.verifyEmail(token);
        if (!auth) {
            throw new GenericException({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Invalid verification token",
                internalStatus: "INVALID_TOKEN"
            });
        }
        return true;
    }

    login = async (email: string, password: string) => {
        const userAuth = await ClubAuthPersistence.getAuthByEmail(email);
        if (!userAuth) throw new NotFoundException('User');

        if (!await validatePassword(password, userAuth.password!)) throw new NotFoundException('User');

        // Check if email is verified
        if (!userAuth.isVerified) {
            throw new GenericException({
                status: HTTP_STATUS.FORBIDDEN,
                message: "Please verify your email address before logging in",
                internalStatus: "EMAIL_NOT_VERIFIED"
            });
        }

        const user = await ClubPersistence.getClubByEmail(email);
        if (!user) throw new NotFoundException('User');

        const accessToken = this.signAccessToken(user.id.toString(), userAuth.email);
        return accessToken;
    }

    verifyToken = async (token: string): Promise<{email: string, id: string, type: string}> => {
        try {
            const pubKey = this.jwtKey;
            const decoded = jwt.verify(token, pubKey) as {email: string, id: string, type: string};

            if (decoded.type !== 'club') {
                throw {status: HTTP_STATUS.FORBIDDEN, message: "Access forbidden: Not a valid club token"};
            }

            const club = await ClubPersistence.getClubById(decoded.id);
            if (!club) {
                throw {status: HTTP_STATUS.FORBIDDEN, message: "Access forbidden: Club not found"};
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
        const payload = {id: userId, email: email, type: 'club'};
        const key = this.jwtKey;
        return jwt.sign(payload, key, {issuer: 'byPS', expiresIn: Number(expiryTime) });
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