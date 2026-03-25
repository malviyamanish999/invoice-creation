import sequelizePaginate from 'sequelize-paginate';
function industryType(sequelize: any, DataTypes: any) {
  const IndustryType = sequelize.define(
    'industry_type',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
  sequelizePaginate.paginate(IndustryType);

  return IndustryType;
}

export default industryType;
