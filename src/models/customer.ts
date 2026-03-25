import sequelizePaginate from 'sequelize-paginate';
function customer(sequelize: any, DataTypes: any) {
  const Customer = sequelize.define(
    'customer',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      taskopad_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'company name already in use!',
        },
      },
      client_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      industries_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile_no: {
        type: DataTypes.STRING,
        allowNull: false,
        // validate: {
        //   notNull: { args: true, msg: 'You must enter Phone Number' },
        //   len: { args: [11, 11], msg: 'Phone Number is invalid' },
        //   isInt: { args: true, msg: 'You must enter Phone Number' },
        // },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: {
          args: true,
          msg: 'Email address already in use!',
        },
      },
      address1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      gst_no: {
        type: DataTypes.STRING(15), // Set a maximum length of 15 characters
        allowNull: true,
        // // unique: true, // Ensure that the GST number is unique
        // validate: {
        //   is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/i, // Use a regular expression to validate the GST number format
        // },
      },
      pan_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gstFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isFromTaskopad: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
    },
    // {
    //   paranoid: true,
    //   deletedAt: 'deletedAt',
    // },
  );
  sequelizePaginate.paginate(Customer);

  return Customer;
}

export default customer;
