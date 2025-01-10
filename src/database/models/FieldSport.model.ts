import {
    Table,
    Model,
    ForeignKey,
    Column,
    DataType
} from 'sequelize-typescript';
import Field from './Field.model';
import Sport from './Sport.model';

@Table({
    timestamps: false,
    tableName: 'field_sports',
    modelName: 'FieldSport'
})
export default class FieldSport extends Model {
    @ForeignKey(() => Field)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'field_id'
    })
    fieldId!: number;

    @ForeignKey(() => Sport)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'sport_id'
    })
    sportId!: number;
} 