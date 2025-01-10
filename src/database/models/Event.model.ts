import { Column, Model, Table, DataType, BelongsTo, CreatedAt, UpdatedAt, HasMany, ForeignKey } from "sequelize-typescript";
import Sport from "./Sport.model";
import Participant from "./Participant.model";
import { OrganizerType } from "../../constants/event.constants";
import User from "./User.model";
import Club from "./Club.model";

export interface IEventDetail {
    event_id: number;
    description: string;
    schedule: string;
    location: string;
    expertise: number;
    sportId: number;
    remaining: string;
    duration: number;
    organizerType: OrganizerType;
    status: number;
    userOwner?: {
        firstname: string;
        id: number;
    };
    clubOwner?: {
        name: string;
        id: number;
    };
}

@Table({
    tableName: 'events',
    modelName: 'Event'
})
class Event extends Model {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: DataType.INTEGER
    })
    declare id: number;

    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'owner_id'
    })
    declare ownerId: number;

    @Column({
        type: DataType.STRING(1024)
    })
    declare description: string;

    @ForeignKey(() => Sport)
    @BelongsTo(() => Sport, { as: 'sport' })
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'sport_id'
    })
    declare sportId: number;

    @Column({
        type: DataType.INTEGER
    })
    declare duration: number;

    @Column({
        type: DataType.DATE
    })
    declare schedule: Date;

    @Column({
        type: DataType.STRING(256)
    })
    declare location: string;

    @Column({
        type: DataType.INTEGER
    })
    declare expertise: number;

    @Column({
        type: DataType.INTEGER
    })
    declare remaining: number;

    @HasMany(() => Participant)
    declare participants: Participant[];

    @Column({
        type: DataType.ENUM(...Object.values(OrganizerType)),
        allowNull: false,
        defaultValue: OrganizerType.USER,
        field: 'organizer_type'
    })
    declare organizerType: OrganizerType;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;

    @BelongsTo(() => User, { 
        foreignKey: 'ownerId',
        as: 'userOwner',
        constraints: false
    })
    declare userOwner: User;

    @BelongsTo(() => Club, { 
        foreignKey: 'ownerId',
        as: 'clubOwner',
        constraints: false
    })
    declare clubOwner: Club;
}

export default Event;
