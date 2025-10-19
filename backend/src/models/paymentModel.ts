import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PaymentAttributes {
  id_payment: number;
  order_id: number;
  payment_method: string;
  amount: number;
  status: string;
  payment_date: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id_payment' | 'status' | 'payment_date'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id_payment!: number;
  public order_id!: number;
  public payment_method!: string;
  public amount!: number;
  public status!: string;
  public payment_date!: Date;
}

Payment.init(
  {
    id_payment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_payment'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'payment_method'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Pending'
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'payment_date'
    }
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: false
  }
);

export default Payment;