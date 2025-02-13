import {
    Column,
    Model,
    Table,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    HasMany,
    CreatedAt,
    UpdatedAt
} from "sequelize-typescript";
import Event from "./Event.model";
import Field from "./Field.model";
import TimeSlot from "./TimeSlot.model";
import { ReservationStatus } from "../../constants/reservation.constants";
import Payment from "./Payment.model";

@Table({
    timestamps: true,
    tableName: 'reservations',
    modelName: 'Reservation'
})
export default class Reservation extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Event)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'event_id'
    })
    eventId!: number;

    @ForeignKey(() => Field)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'field_id'
    })
    fieldId!: number;

    @Column({
        type: DataType.ENUM(...Object.values(ReservationStatus)),
        defaultValue: ReservationStatus.PENDING,
        field: 'status'
    })
    status!: ReservationStatus;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    cost!: number;

    @BelongsTo(() => Event)
    event!: Event;

    @BelongsTo(() => Field)
    field!: Field;

    @HasMany(() => TimeSlot)
    timeSlots!: TimeSlot[];

    @HasMany(() => Payment)
    payments!: Payment[];

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;

    public isConfirmed(): boolean {
        return this.status === ReservationStatus.CONFIRMED;
    }

    public getCost(): number {
        return Number(this.cost);
    }
} 