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

export enum SlotStatus {
    AVAILABLE = 'available',
    BOOKED = 'booked',
    MAINTENANCE = 'maintenance'
}

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

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
} 