import { Column, Model, Table, DataType, Unique, HasMany, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";
import UserSport from "./UserSport.model";
import Event from './Event.model';
import UserLocation from "./UserLocation.model";
import Rating from "./Rating.model";

export interface IUserDetail {
    user_id: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    birth_date: string;
    email: string;
    rating: number;
    count: number;
    sports: number[];
    locations: string[];
}

export interface IUserAttributes {
    id?: number;
    firstname: string;
    lastname: string;
    phone_number: string;
    birthdate: string;
    email: string;
    rating?: number;
    count?: number;
    sports?: UserSport[];
    locations?: UserLocation[];
    ratings?: Rating[];
    events?: Event[];
}

@Table({
    timestamps: true,
    tableName: 'users',
    modelName: 'User'
})
class User extends Model<IUserAttributes> {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.INTEGER,
        autoIncrement: true
    })
    declare id: number;

    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare firstname: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare lastname: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare phone_number: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare email: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(10)
    })
    declare birthdate: string;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;

    @Column({
        type: DataType.VIRTUAL(DataType.DOUBLE),
        get(this: User) {
            return this.getDataValue('rating');
        }
    })
    declare readonly rating: number;

    @HasMany(() => UserSport)
    declare sports: UserSport[];

    @HasMany(() => Event)
    declare events: Event[];

    @HasMany(() => UserLocation)
    declare locations: UserLocation[];

    @HasMany(() => Rating)
    declare ratings: Rating[];

    toString() {
        return `${this.firstname} ${this.lastname} <${this.email}> (${this.phone_number}) - [${this.sports.map(sport => sport.toString()).join(', ')}] - [${this.locations.map(location => location.toString()).join(', ')}]`
    }
}

export default User;
