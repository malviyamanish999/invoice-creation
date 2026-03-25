import sequelizePaginate from 'sequelize-paginate';
function description(sequelize: any, DataTypes: any) {
  const Description = sequelize.define(
    'description',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(Description);

  return Description;
}

export default description;
