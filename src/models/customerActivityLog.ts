import sequelizePaginate from 'sequelize-paginate';
function customerActivityLog(sequelize: any, DataTypes: any) {
    const CustomerActivityLog = sequelize.define(
        'customer_activity_log',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            adminId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ownerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            updateField: {
                type: DataTypes.ENUM,
                values: ['expireDate', 'employeeLimit', 'fileStorageLimit', 'email', 'password', 'verifyEmail'],
                allowNull: false,
            },
            updatedValue: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            existingValue: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isUpdatedInTaskopad: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            taskopadUpdateResponse: {
                type: DataTypes.STRING,
                default: null
            }
        }
    );
    sequelizePaginate.paginate(CustomerActivityLog);

    return CustomerActivityLog;
}

export default customerActivityLog;
