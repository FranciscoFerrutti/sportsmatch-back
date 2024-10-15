// Club.model.ts
import {
    Column, Model, Table, DataType, HasMany,
    PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, Unique
} from "sequelize-typescript";
import ClubLocation from "./ClubLocation.model";


export interface IClubAttributes {
    id?: number;
    name: string;
    phone_number: string;
    email: string;
    locations?: ClubLocation[];
}
@Table({
    timestamps: true,
    tableName: 'clubs',
    modelName: 'Club'
})
export default class Club extends Model<IClubAttributes> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column(DataType.STRING)
    name!: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare email: string;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare phone_number: string;

    @Column(DataType.STRING)
    description?: string;

    @HasMany(() => ClubLocation)
    locations!: ClubLocation[];

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
}