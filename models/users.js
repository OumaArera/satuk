module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false, 
            unique: true, 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        type: {
            type: DataTypes.ENUM('admin', 'standard'), 
            defaultValue: 'standard', 
        },
    }, {
        // Additional model options
        tableName: 'Users', 
        timestamps: true, 
    });

    return User;
};
