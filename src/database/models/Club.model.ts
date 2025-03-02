// Club.model.ts
import {
    Column, Model, Table, DataType, HasOne,
    PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, Unique, HasMany
} from "sequelize-typescript";
import ClubLocation from "./ClubLocation.model";
import Field from "./Field.model"; // Import the Field model
import Event from "./Event.model";
import { OrganizerType } from "../../constants/event.constants";


export interface IClubDetail {
    id: number;
    name: string;
    phone_number: string;
    email: string;
    locations: string[];
}
export interface IClubAttributes {
    id?: number;
    name: string;
    phone_number: string;
    email: string;
    locations?: ClubLocation[];
}
@Table({
    timestamps: true,
    tableName: 'clubs',
    modelName: 'Club'
})
export default class Club extends Model<IClubAttributes> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column(DataType.STRING)
    name!: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare email: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare phone_number: string;

    @Column(DataType.STRING)
    description?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    image_url?: string;


    @HasOne(() => ClubLocation)
    location!: ClubLocation;

    @HasMany(() => Field)
    fields!: Field[];

    @HasMany(() => Event, {
        foreignKey: 'owner_id',
        constraints: false,
        scope: {
            organizerType: OrganizerType.CLUB
        }
    })
    declare events: Event[];

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
}