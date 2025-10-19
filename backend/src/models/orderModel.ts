import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface OrderAttributes {
  id_order: number;
  user_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id_order' | 'order_date' | 'status'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id_order!: number;
  public user_id!: number;
  public order_date!: Date;
  public status!: string;
  public total_amount!: number;
}

Order.init(
  {
    id_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_order'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'order_date'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Pending'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    }
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: false
  }
);

export default Order;