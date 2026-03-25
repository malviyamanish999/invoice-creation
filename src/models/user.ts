import sequelizePaginate from 'sequelize-paginate';
function user(sequelize: any, DataTypes: any) {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
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
      // empId: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      // designation: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: ['creator', 'manager', 'API'],
        defaultValue: 'creator',
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      paranoid: true,
      deletedAt: 'deletedAt',
    },
  );
  sequelizePaginate.paginate(User);

  return User;
}

export default user;
