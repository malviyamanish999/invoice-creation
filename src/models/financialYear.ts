import sequelizePaginate from 'sequelize-paginate';
function financialYear(sequelize: any, DataTypes: any) {
  const FinancialYear = sequelize.define(
    'financial_year',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(FinancialYear);

  return FinancialYear;
}

export default financialYear;
