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
import Reservation from "./Reservation.model";

export enum PaymentStatus {
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PENDING = 'pending'
}

@Table({
    timestamps: true,
    tableName: 'payments',
    modelName: 'Payment'
})
export default class Payment extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'transaction_amount'
    })
    transactionAmount!: number;

    @Column({
        type: DataType.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        field: 'transaction_status'
    })
    transactionStatus!: PaymentStatus;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'transaction_date'
    })
    transactionDate!: Date;

    @Column({
        type: DataType.INTEGER,
        field: 'mp_id'
    })
    mpId!: number;

    @ForeignKey(() => Reservation)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'reservation_id'
    })
    reservationId!: number;

    @BelongsTo(() => Reservation)
    reservation!: Reservation;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
} 