import { Column, Model, Table, DataType, Unique, PrimaryKey, AutoIncrement, UpdatedAt, CreatedAt } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: 'sports',
    modelName: 'Sport'
})
class Sport extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare id: number;

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING(256)
    })
    declare name: string;

    @UpdatedAt
    declare updated_at: Date;

    @CreatedAt
    declare created_at: Date;

    toString() {
        return `id: ${this.id} name: ${this.name}`
    }

    // deportes iniciales
    static async seedSports() {
        const sports = ['football', 'tennis', 'hockey', 'basket'];
        for (const name of sports) {
            await Sport.findOrCreate({ where: { name } });
        }
    }
}

export default Sport;