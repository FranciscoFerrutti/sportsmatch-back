// ClubLocation.model.ts
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
    clubId!: number;

    @BelongsTo(() => Club)
    club!: Club;

    @Column(DataType.STRING(8))
    geohash!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;
}