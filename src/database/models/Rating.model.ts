import { Column, Model, Table, DataType, ForeignKey, BelongsTo, Unique, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";
import User from "./User.model";
import Event from "./Event.model";

@Table({
    timestamps: true,
    tableName: 'ratings',
    modelName: 'Rating',
    underscored: true
})
class Rating extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare id: number;

    @ForeignKey(() => User)
    @BelongsTo(() => User, { as: 'raterUser'})
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare rater: number;

    @ForeignKey(() => User)
    @BelongsTo(() => User, { as: 'ratedUser'})
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare rated: number;

    @ForeignKey(() => Event)
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
    })
    declare eventId: number;

    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare rating: number;

    @BelongsTo(() => Event)
    declare event: Event;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;
}

export default Rating;