import sequelizePaginate from 'sequelize-paginate';
function paymentRecord(sequelize: any, DataTypes: any) {
  const PaymentRecord = sequelize.define(
    'payment_record',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bill_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bill_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payment_received: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tds: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_gateway: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_difference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subcription_endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      total_out_standing: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      razorpay_payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      razorpay_payment_link_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      razorpay_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      razorpay_signature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subcription_startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      taxInvoiceNo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isTdsInPercentage: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(PaymentRecord);

  return PaymentRecord;
}

export default paymentRecord;
