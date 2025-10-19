import { User, Order, Payment, OrderDetail, Shipping } from '../models';
import { Op } from 'sequelize';

export class OrderService {
  async getOrdersByUserId(userId: number) {
    const user = await User.findOne({
      where: { id: userId, id_role: 2 }
    });

    if (!user) {
      throw new Error('Cliente no encontrado');
    }

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Payment,
          as: 'payments',
          attributes: ['id_payment', 'payment_method', 'amount', 'status', 'payment_date']
        },
        {
          model: OrderDetail,
          as: 'details',
          attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
        },
        {
          model: Shipping,
          as: 'shipping',
          attributes: ['id_shipping', 'address', 'city', 'status', 'transport_company', 'shipping_date']
        }
      ],
      order: [['order_date', 'DESC']]
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      totalOrders: orders.length,
      orders
    };
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await Order.findOne({
      where: { 
        id_order: orderId, 
        user_id: userId 
      },
      include: [
        { 
          model: Payment, 
          as: 'payments' 
        },
        { 
          model: OrderDetail, 
          as: 'details' 
        },
        { 
          model: Shipping, 
          as: 'shipping' 
        }
      ]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    return order;
  }

  async getOrdersByStatus(userId: number, status: string) {
    const orders = await Order.findAll({
      where: { 
        user_id: userId,
        status 
      },
      include: [
        { model: Payment, as: 'payments' },
        { model: OrderDetail, as: 'details' },
        { model: Shipping, as: 'shipping' }
      ],
      order: [['order_date', 'DESC']]
    });

    return orders;
  }

  async getPaymentsByUser(userId: number) {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: { user_id: userId },
          attributes: ['id_order', 'order_date', 'status', 'total_amount']
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    return payments;
  }

  async getAllOrders() {
    const orders = await Order.findAll({
      include: [
        { model: Payment, as: 'payments' },
        { model: OrderDetail, as: 'details' },
        { model: Shipping, as: 'shipping' }
      ],
      order: [['order_date', 'DESC']]
    });
    return orders;
  }

  async getPaymentsByOrderId(orderId: number) {
    const payments = await Payment.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount']
        }
      ],
      order: [['payment_date', 'DESC']]
    });
    return payments;
  }

  async getOrderDetailsById(orderId: number) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Payment, as: 'payments' },
        { model: OrderDetail, as: 'details' },
        { model: Shipping, as: 'shipping' }
      ]
    });
    if (!order) {
      throw new Error('Pedido no encontrado');
    }
    return order;
  }
}
