import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Host from './Host.js';
import Property from './Property.js';
import Admin from './Admin.js';

const ApprovedHost = sequelize.define('ApprovedHost', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  host_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  approved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  host_snapshot: {
    type: DataTypes.JSON,
    allowNull: true
  },

  property_snapshot: {
    type: DataTypes.JSON,
    allowNull: true
  }

}, {
  tableName: 'approved_hosts',
  timestamps: true,
  underscored: true
});

// Relations (Correct FK mapping)
ApprovedHost.belongsTo(User, { foreignKey: 'user_id' });
ApprovedHost.belongsTo(Host, { foreignKey: 'host_id' });
ApprovedHost.belongsTo(Property, { foreignKey: 'property_id' });
ApprovedHost.belongsTo(Admin, { foreignKey: 'approved_by' });

export default ApprovedHost;
