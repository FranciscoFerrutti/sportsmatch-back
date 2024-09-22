import { Column, Model, Table, DataType, Unique, HasMany, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: 'auth',
    modelName: 'Auth'
})
class Auth extends Model {
    @Column({
        primaryKey: true,
        allowNull: false,
        type: DataType.INTEGER,
        autoIncrement: true
    })
    declare id: number;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare email: string;

    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare password: string;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;
}

export default Auth;
