import User from './userModel';
import Role from './roleModel';
import Order from './orderModel';
import OrderDetail from './orderDetailModel';
import Payment from './paymentModel';
import Shipping from './shippingModel';
import Producto from './productoModels'

// Definir todas las relaciones
User.belongsTo(Role, { foreignKey: 'id_role', as: 'role' });
Role.hasMany(User, { foreignKey: 'id_role', as: 'users' });

Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });

OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details' });

Shipping.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasOne(Shipping, { foreignKey: 'order_id', as: 'shipping' });

export { User, Role, Order, OrderDetail, Payment, Shipping };