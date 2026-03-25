import sequelizePaginate from 'sequelize-paginate';
import { Constants } from '../../config/constants';
function invoiceData(sequelize: any, DataTypes: any) {
  const InvoiceData = sequelize.define(
    'invoice_data',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
        type: DataTypes.DECIMAL(20, 2),
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
        allowNull: false,
      },
      invoiceType: {
        type: DataTypes.STRING,
        default: Constants.INVOICE_TYPE.TAX,
      },
      proformaPaymentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      linkedInvoiceNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      planDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pdfLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(InvoiceData);
  return InvoiceData;
}

export default invoiceData;
