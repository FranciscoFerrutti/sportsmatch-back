// Field.model.ts
import {
    Column, Model, Table, DataType, ForeignKey, BelongsTo,
    PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt
} from "sequelize-typescript";
import Club from "./Club.model"; // Import the Club model

@Table({
    timestamps: true,
    tableName: 'fields',
    modelName: 'Field'
})
export default class Field extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column(DataType.STRING)
    name!: string;

    @Column(DataType.STRING)
    description?: string;

    @Column(DataType.FLOAT)
    cost_per_minute!: number;

    @Column(DataType.INTEGER)
    capacity!: number;

    @ForeignKey(() => Club) // Foreign key referencing the Club model
    @Column(DataType.INTEGER)
    club_id!: number;

    @BelongsTo(() => Club) // Define the belongsTo relationship
    club!: Club;

    @CreatedAt
    created_at!: Date;

    @UpdatedAt
    updated_at!: Date;
}