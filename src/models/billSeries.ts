import sequelizePaginate from 'sequelize-paginate';
function billSeries(sequelize: any, DataTypes: any) {
  const BillSeries = sequelize.define(
    'bill_series',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      series: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      to: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      seriesType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      seriesStart: {
        type: DataTypes.INTEGER,
        allowNull: null,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(BillSeries);

  return BillSeries;
}

export default billSeries;
