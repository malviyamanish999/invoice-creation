import sequelizePaginate from 'sequelize-paginate';
function state(sequelize: any, DataTypes: any) {
  const State = sequelize.define(
    'state',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      no: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isoCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(State);

  return State;
}

export default state;
