import { Column, Model, Table, DataType, ForeignKey, BelongsTo, Unique, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";
import User from "./User.model";
import Event from "./Event.model";

export interface IParticipantDetail {
    user_id: number,
    firstname: string,
    lastname: string,
    email: string,
    participant_status: boolean,
    phone_number: string,
    image_url: string,
    rating: number,
    count: number,
    is_rated: boolean
}

export enum ParticipantStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
}

@Table({
    timestamps: true,
    tableName: 'participants',
    modelName: 'Participant'
})
class Participant extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare id: number;

    @ForeignKey(() => User)
    // @BelongsTo(() => User)
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'user_id'
    })
    declare userId: number;

    @Column({
        allowNull: false,
        type: DataType.BOOLEAN()
    })
    declare status: boolean;

    @ForeignKey(() => Event)
    @BelongsTo(() => Event, { as: 'participants'})
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
        field: 'event_id'
    })
    declare eventId: number;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;
}

export default Participant;