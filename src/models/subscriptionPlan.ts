import sequelizePaginate from 'sequelize-paginate';
function subcriptionPlan(sequelize: any, DataTypes: any) {
  const SubcriptionPlan = sequelize.define(
    'subcription_plan',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(SubcriptionPlan);

  return SubcriptionPlan;
}

export default subcriptionPlan;
