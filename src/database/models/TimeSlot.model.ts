import {
    Column,
    Model,
    Table,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt
} from "sequelize-typescript";
import Field from "./Field.model";
import { SlotStatus } from "../../constants/slots.constants";
import Reservation from "./Reservation.model";

@Table({
    timestamps: true,
    tableName: 'time_slots',
    modelName: 'TimeSlot'
})
export default class TimeSlot extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Field)
    @Column(DataType.INTEGER)
    field_id!: number;

    @ForeignKey(() => Reservation)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reservation_id'
    })
    reservationId!: number | null;

    @Column({
        allowNull: false,
        type: DataType.DATEONLY,
        comment: 'Format: YYYY-MM-DD'
    })
    availability_date!: Date;

    @Column({
        allowNull: false,
        type: DataType.TIME,
        comment: 'Format: HH:mm'
    })
    start_time!: Date;

    @Column({
        allowNull: false,
        type: DataType.TIME,
        comment: 'Format: HH:mm'
    })
    end_time!: Date;

    @Column({
        type: DataType.ENUM(...Object.values(SlotStatus)),
        defaultValue: SlotStatus.AVAILABLE,
        field: 'slot_status'
    })
    slotStatus!: SlotStatus;

    @BelongsTo(() => Field)
    field!: Field;

    @BelongsTo(() => Reservation)
    reservation!: Reservation;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
} 