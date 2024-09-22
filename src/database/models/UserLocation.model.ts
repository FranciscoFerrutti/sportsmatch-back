import { Column, Model, Table, DataType, ForeignKey, BelongsTo, Unique, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";
import User from "./User.model";
import { override } from "core-decorators";

@Table({
    timestamps: true,
    tableName: 'users_locations',
    modelName: 'UserLocation'
})
class UserLocation extends Model {
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

    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare location: string;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;

    toString() {
        return `id: ${this.id} location: ${this.location}`;
    }
}

export default UserLocation;
