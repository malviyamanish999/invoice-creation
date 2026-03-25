import sequelizePaginate from 'sequelize-paginate';
function paymentGateway(sequelize: any, DataTypes: any) {
  const PaymentGateway = sequelize.define(
    'payment_gateway',
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
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(PaymentGateway);

  return PaymentGateway;
}

export default paymentGateway;
