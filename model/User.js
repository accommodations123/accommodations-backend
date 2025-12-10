import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  otp: {
    type: DataTypes.STRING
  },
  otpExpires: {
    type: DataTypes.DATE,
    field: 'otp_expires',
    allowNull: true
  },
  verified: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false 
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

export default User;
