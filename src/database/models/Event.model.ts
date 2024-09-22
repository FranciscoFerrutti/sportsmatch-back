import { Column, Model, Table, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, HasMany } from "sequelize-typescript";
import User from "./User.model";
import Sport from "./Sport.model";
import Participant from "./Participant.model";

export interface IEventDetail {
    event_id: number,
    description: string,
    schedule: string,
    location: string,
    expertise: number,
    sportId: number,
    remaining: string,
    owner: { 
        firstname: string,
        id: number 
    }
    status: number
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

    @ForeignKey(() => User)
    @BelongsTo(() => User, { as: 'owner' })
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

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;
}

export default Event;
