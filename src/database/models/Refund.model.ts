import {
    Column,
    Model,
    Table,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    CreatedAt, UpdatedAt
} from "sequelize-typescript";
import Payment from "./Payment.model";

@Table({
    timestamps: true,
    tableName: 'refunds',
    modelName: 'Refund'
})
export default class Refund extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'refund_id'
    })
    refundId!: number;

    @ForeignKey(() => Payment)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'payment_id'
    })
    paymentId!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'date_created'
    })
    dateCreated!: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount_refunded'
    })
    amountRefunded!: number;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;

    @BelongsTo(() => Payment)
    payment!: Payment;
} 