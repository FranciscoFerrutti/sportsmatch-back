import {
    Column, Model, Table, DataType, ForeignKey,
    BelongsTo, PrimaryKey, AutoIncrement,
    CreatedAt, UpdatedAt
} from "sequelize-typescript";
import Club from "./Club.model";

@Table({
    timestamps: true,
    tableName: 'club_locations',
    modelName: 'ClubLocation'
})
export default class ClubLocation extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @ForeignKey(() => Club)
    @Column(DataType.INTEGER)
    club_id!: number;

    @BelongsTo(() => Club)
    club!: Club;

    @Column(DataType.STRING(8))
    geohash!: string;

    @Column(DataType.STRING(256))
    address!: string;

    @Column(DataType.DECIMAL)
    latitude!: number;

    @Column(DataType.DECIMAL)
    longitude!: number;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
}