import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface OrderDetailAttributes {
  id_detail_order: number;
  order_id: number;
  product_sku: string;
  quantity: number;
  price: number;
}

interface OrderDetailCreationAttributes extends Optional<OrderDetailAttributes, 'id_detail_order'> {}

class OrderDetail extends Model<OrderDetailAttributes, OrderDetailCreationAttributes> implements OrderDetailAttributes {
  public id_detail_order!: number;
  public order_id!: number;
  public product_sku!: string;
  public quantity!: number;
  public price!: number;
}

OrderDetail.init(
  {
    id_detail_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_detail_order'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id'
    },
    product_sku: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'product_sku'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'details_orders',
    timestamps: false
  }
);

export default OrderDetail;