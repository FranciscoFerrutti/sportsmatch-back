import { Column, Model, Table, DataType, ForeignKey, BelongsTo, Unique, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";
import User from "./User.model";
import Sport from "./Sport.model";

@Table({
    timestamps: true,
    tableName: 'users_sports',
    modelName: 'UserSport'
})
class UserSport extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare id: number;

    @ForeignKey(() => User)
    @BelongsTo(() => User, { as: 'user' })
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare user_id: number;

    @ForeignKey(() => Sport)
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare sport_id: number;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;

    @BelongsTo(() => Sport, { as: 'sport' })
    declare sport: Sport

    toString() {
        return `id: ${this.id} ${this.sport ? `sport: ${this.sport.toString()}` : `sport_id: ${this.sport_id}`}`
    }
}

export default UserSport;
