import {
    Column, Model, Table, DataType, ForeignKey, BelongsTo,
    PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt
} from "sequelize-typescript";
import Field from "./Field.model";

export enum AvailabilityStatus {
    AVAILABLE = "available",
    BOOKED = "booked",
    MAINTENANCE = "maintenance"
}

@Table({
    timestamps: true,
    tableName: 'availabilities',
    modelName: 'Availability'
})
export default class Availability extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column({
        allowNull: false,
        type: DataType.DATEONLY,
        comment: 'Format: YYYY-MM-DD'
    })
    date!: Date;

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
        allowNull: false,
        type: DataType.ENUM(...Object.values(AvailabilityStatus)),
        defaultValue: AvailabilityStatus.AVAILABLE
    })
    status!: AvailabilityStatus;

    @ForeignKey(() => Field)
    @Column(DataType.INTEGER)
    field_id!: number;

    @BelongsTo(() => Field)
    field!: Field;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
} 