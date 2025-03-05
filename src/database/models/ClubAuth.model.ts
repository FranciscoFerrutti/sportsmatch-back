import { Column, Model, Table, DataType, Unique, HasMany, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: 'club_auth',
    modelName: 'ClubAuth'
})
class ClubAuth extends Model {
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

    @Column({
        allowNull: false,
        type: DataType.BOOLEAN,
        defaultValue: false,
        field: 'is_verified'
    })
    declare isVerified: boolean;

    @Column({
        allowNull: true,
        type: DataType.STRING(64),
        defaultValue: null,
        field: 'verification_token'
    })
    declare verificationToken: string | null;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;
}

export default ClubAuth;