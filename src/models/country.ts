import sequelizePaginate from 'sequelize-paginate';
function country(sequelize: any, DataTypes: any) {
  const Country = sequelize.define(
    'country',
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
      isoCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(Country);

  return Country;
}

export default country;
