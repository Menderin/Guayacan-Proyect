import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ShippingAttributes {
  id_shipping: number;
  order_id: number;
  address: string;
  city: string;
  shipping_date: Date;
  status: string;
  transport_company: string;
}

interface ShippingCreationAttributes extends Optional<ShippingAttributes, 'id_shipping' | 'shipping_date' | 'status'> {}

class Shipping extends Model<ShippingAttributes, ShippingCreationAttributes> implements ShippingAttributes {
  public id_shipping!: number;
  public order_id!: number;
  public address!: string;
  public city!: string;
  public shipping_date!: Date;
  public status!: string;
  public transport_company!: string;
}

Shipping.init(
  {
    id_shipping: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_shipping'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    shipping_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'shipping_date'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Processing'
    },
    transport_company: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'transport_company'
    }
  },
  {
    sequelize,
    tableName: 'shipping',
    timestamps: false
  }
);

export default Shipping;