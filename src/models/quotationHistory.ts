import sequelizePaginate from 'sequelize-paginate';
function quotationHistoryData(sequelize: any, DataTypes: any) {
  const QuotationHistoryData = sequelize.define(
    'quotation_history',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      // invoice_no: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      quotation_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      license_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      // customer_name: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      subcription_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // plan: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // validate: {
        //   notNull: {
        //     msg: 'user cannot be null',
        //   },
        // },
      },
      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      final_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      CGST: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      SGST: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      IGST: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      rounding_off: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receivable_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      license_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      extended_license_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      validate_for: {
        type: DataTypes.STRING,
      },
      calendar_days: {
        type: DataTypes.INTEGER,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(QuotationHistoryData);

  return QuotationHistoryData;
}

export default quotationHistoryData;
