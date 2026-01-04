import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import TravelTrip from './TravelTrip.js';

const TravelMatch = sequelize.define('TravelMatch', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  matched_trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
    // pending, accepted, rejected, cancelled
  },

  consent_given: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

}, {
  tableName: 'travel_matches',
  timestamps: true,
  underscored: true,

  uniqueKeys: {
    unique_trip_pair: {
      fields: ['trip_id', 'matched_trip_id']
    }
  },

  indexes: [
    // 🔥 Find my outgoing requests
    {
      name: 'idx_match_trip',
      fields: ['trip_id']
    },

    // 🔥 Find incoming requests (MOST USED)
    {
      name: 'idx_match_matched_trip',
      fields: ['matched_trip_id']
    },

    // 🔥 Pending requests list
    {
      name: 'idx_match_status',
      fields: ['matched_trip_id', 'status']
    },

    // 🔥 Accept / cancel lookup
    {
      name: 'idx_match_pair_status',
      fields: ['trip_id', 'matched_trip_id', 'status']
    }
  ]
});

// 🔒 ALIASED RELATIONS (CRITICAL)
TravelMatch.belongsTo(TravelTrip, {
  foreignKey: 'trip_id',
  as: 'requesterTrip',
  onDelete: 'CASCADE'
});

TravelMatch.belongsTo(TravelTrip, {
  foreignKey: 'matched_trip_id',
  as: 'receiverTrip',
  onDelete: 'CASCADE'
});

export default TravelMatch;
