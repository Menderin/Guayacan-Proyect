import { User, Order, OrderDetail, Shipping } from '../models';
import Producto from '../models/productoModels';
import Payment from '../models/paymentModel';
import { Op } from 'sequelize';
import { OrderService } from './order.service';

export interface OrderWithDetails {
  id_order: number;
  user_id: number;
  order_date: Date;
  status: string;
  total_amount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  details: Array<{
    id_detail_order: number;
    product_sku: string;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
      sku: string;
      name: string;
      category: string;
      stock: number;
      images?: string[];
    } | null;
  }>;
  shipping?: {
    id_shipping: number;
    address: string;
    city: string;
    status: string;
    transport_company?: string;
    shipping_date?: Date;
  };
  payments?: Array<{
    id_payment: number;
    amount: number;
    payment_method: string;
    status: string;
    payment_date?: Date;
  }>;
}

export interface PaymentWithDetails {
  id_payment: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: Date;
  user: {
    id: number;
    name: string;
    email: string;
  };
  order: {
    id_order: number;
    order_date: Date;
    status: string;
    total_amount: number;
    details: Array<{
      id_detail_order: number;
      product_sku: string;
      quantity: number;
      price: number;
      subtotal: number;
      product: {
        sku: string;
        name: string;
        category: string;
        stock: number;
        images?: string[];
      } | null;
    }>;
  };
}

export class PaymentService {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  private async enrichOrdersWithProducts(orders: any[]): Promise<OrderWithDetails[]> {
    const allSkus = new Set<string>();
    orders.forEach(order => {
      const details = Array.isArray(order.details) ? order.details : 
                      order.get ? order.get('details') : [];
      details.forEach((detail: any) => allSkus.add(detail.product_sku));
    });

    if (allSkus.size === 0) {
      return orders.map(order => {
        const orderJson = typeof order.toJSON === 'function' ? order.toJSON() : order;
        return {
          ...orderJson,
          details: []
        };
      });
    }

    const products = await Producto.find({
      sku: { $in: Array.from(allSkus) }
    }).select('sku name category stock images').lean();

    const productsMap = new Map(products.map(p => [p.sku, p]));

    return orders.map(order => {
      const orderJson = typeof order.toJSON === 'function' ? order.toJSON() : order;
      
      const detailsWithProducts = orderJson.details.map((detail: any) => ({
        id_detail_order: detail.id_detail_order,
        product_sku: detail.product_sku,
        quantity: detail.quantity,
        price: parseFloat(detail.price),
        subtotal: parseFloat(detail.price) * detail.quantity,
        product: productsMap.get(detail.product_sku) || null
      }));

      return {
        id_order: orderJson.id_order,
        user_id: orderJson.user_id,
        order_date: orderJson.order_date,
        status: orderJson.status,
        total_amount: parseFloat(orderJson.total_amount),
        user: orderJson.user,
        details: detailsWithProducts,
        shipping: orderJson.shipping,
        payments: orderJson.payments
      };
    });
  }

  private async enrichPaymentsWithProducts(payments: any[]): Promise<PaymentWithDetails[]> {
    const allSkus = new Set<string>();
    payments.forEach(payment => {
      const order = payment.order || payment.get?.('order');
      if (order) {
        const details = Array.isArray(order.details) ? order.details : 
                        order.get ? order.get('details') : [];
        details.forEach((detail: any) => allSkus.add(detail.product_sku));
      }
    });

    let productsMap = new Map();
    if (allSkus.size > 0) {
      const products = await Producto.find({
        sku: { $in: Array.from(allSkus) }
      }).select('sku name category stock images').lean();

      productsMap = new Map(products.map(p => [p.sku, p]));
    }

    return payments.map(payment => {
      const paymentJson = typeof payment.toJSON === 'function' ? payment.toJSON() : payment;
      
      let orderWithProducts = null;
      let userInfo = null;

      if (paymentJson.order) {
        const detailsWithProducts = paymentJson.order.details?.map((detail: any) => ({
          id_detail_order: detail.id_detail_order,
          product_sku: detail.product_sku,
          quantity: detail.quantity,
          price: parseFloat(detail.price),
          subtotal: parseFloat(detail.price) * detail.quantity,
          product: productsMap.get(detail.product_sku) || null
        })) || [];

        orderWithProducts = {
          id_order: paymentJson.order.id_order,
          order_date: paymentJson.order.order_date,
          status: paymentJson.order.status,
          total_amount: parseFloat(paymentJson.order.total_amount),
          details: detailsWithProducts
        };

        userInfo = paymentJson.order.user || null;
      }

      return {
        id_payment: paymentJson.id_payment,
        order_id: paymentJson.order_id,
        amount: parseFloat(paymentJson.amount),
        payment_method: paymentJson.payment_method,
        status: paymentJson.status,
        payment_date: paymentJson.payment_date,
        user: userInfo,
        order: orderWithProducts!
      };
    });
  }

  async getAllPayments(): Promise<PaymentWithDetails[]> {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            },
            {
              model: OrderDetail,
              as: 'details',
              attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    return this.enrichPaymentsWithProducts(payments);
  }

  async getPaymentsByStatus(status: string): Promise<PaymentWithDetails[]> {
    const payments = await Payment.findAll({
      where: { status },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            },
            {
              model: OrderDetail,
              as: 'details',
              attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    return this.enrichPaymentsWithProducts(payments);
  }

  async getPaymentsWithFilters(filters: {
    startDate?: string;
    endDate?: string;
    userId?: number;
    status?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    payments: PaymentWithDetails[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      startDate,
      endDate,
      userId,
      status,
      paymentMethod,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10
    } = filters;

    const whereConditions: any = {};

    if (startDate || endDate) {
      whereConditions.payment_date = {};
      if (startDate) {
        whereConditions.payment_date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.payment_date[Op.lte] = new Date(endDate);
      }
    }

    if (status) {
      whereConditions.status = status;
    }

    if (paymentMethod) {
      whereConditions.payment_method = paymentMethod;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      whereConditions.amount = {};
      if (minAmount !== undefined) {
        whereConditions.amount[Op.gte] = minAmount;
      }
      if (maxAmount !== undefined) {
        whereConditions.amount[Op.lte] = maxAmount;
      }
    }

    const userWhereConditions: any = {};
    if (userId) {
      userWhereConditions.id = userId;
    }

    const offset = (page - 1) * limit;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          required: true,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
              where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined,
              required: Object.keys(userWhereConditions).length > 0
            },
            {
              model: OrderDetail,
              as: 'details',
              attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['payment_date', 'DESC']],
      distinct: true
    });

    const paymentsWithProducts = await this.enrichPaymentsWithProducts(payments);

    return {
      payments: paymentsWithProducts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getPaymentById(paymentId: number): Promise<PaymentWithDetails | null> {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
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
          ]
        }
      ]
    });

    if (!payment) return null;

    const enrichedPayments = await this.enrichPaymentsWithProducts([payment]);
    return enrichedPayments[0];
  }

  async getPaymentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMethod: Record<string, number>;
    totalAmount: number;
  }> {
    const payments = await Payment.findAll({
      attributes: ['status', 'payment_method', 'amount']
    });

    const stats = {
      total: payments.length,
      byStatus: {} as Record<string, number>,
      byMethod: {} as Record<string, number>,
      totalAmount: 0
    };

    payments.forEach(payment => {
      const paymentJson = payment.toJSON();
      
      stats.byStatus[paymentJson.status] = (stats.byStatus[paymentJson.status] || 0) + 1;
      stats.byMethod[paymentJson.payment_method] = (stats.byMethod[paymentJson.payment_method] || 0) + 1;
      stats.totalAmount += parseFloat(paymentJson.amount.toString());
    });

    return stats;
  }

  async getPaymentsByOrderId(orderId: number): Promise<any[]> {
    const payments = await Payment.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            },
            {
              model: OrderDetail,
              as: 'details',
              attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    if (!payments || payments.length === 0) {
      return [];
    }

    return this.enrichPaymentsWithProducts(payments);
  }

  async getPaymentsByUserId(userId: number): Promise<any[]> {
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            },
            {              model: OrderDetail,
              as: 'details',
              attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });
    if (!payments || payments.length === 0) {
      return [];
    }
    return this.enrichPaymentsWithProducts(payments);
  }

  async createPayment(paymentData: {
    orderId: number;
    paymentMethod: string;
    amount: number;
    status?: string;
  }) {
    const { sequelize } = await import('../config/database');
    const transaction = await sequelize.transaction();

    try {
      const { orderId, paymentMethod, amount, status = 'Pending' } = paymentData;

      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Payment,
            as: 'payments',
            attributes: ['id_payment', 'amount', 'status']
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        throw new Error('Pedido no encontrado');
      }

      if (order.status === 'Cancelled') {
        await transaction.rollback();
        throw new Error('No se puede registrar un pago para un pedido cancelado');
      }

      const payments = order.get('payments') as any[];
      
      const totalPaid = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const orderTotal = parseFloat(order.total_amount.toString());
      const remainingAmount = orderTotal - totalPaid;

      if (amount > remainingAmount) {
        await transaction.rollback();
        throw new Error(
          `El monto del pago ($${amount.toLocaleString()}) excede el monto pendiente ($${remainingAmount.toLocaleString()})`
        );
      }

      if (remainingAmount === 0) {
        await transaction.rollback();
        throw new Error('Este pedido ya está completamente pagado. No se pueden registrar más pagos.');
      }

      if (amount <= 0) {
        await transaction.rollback();
        throw new Error('El monto debe ser mayor a 0');
      }

      const payment = await Payment.create(
        {
          order_id: orderId,
          payment_method: paymentMethod,
          amount: amount,
          status: status,
          payment_date: new Date()
        },
        { transaction }
      );

      await transaction.commit();

      await this.orderService.recalculateOrderStatus(orderId);

      const updatedOrder = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Payment,
            as: 'payments',
            attributes: ['id_payment', 'amount', 'status']
          }
        ]
      });

      const updatedPayments = updatedOrder!.get('payments') as any[];
      const newTotalPaid = updatedPayments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      return {
        payment: {
          id_payment: payment.id_payment,
          order_id: payment.order_id,
          payment_method: payment.payment_method,
          amount: parseFloat(payment.amount.toString()),
          status: payment.status,
          payment_date: payment.payment_date
        },
        order: {
          id_order: updatedOrder!.id_order,
          user_id: updatedOrder!.user_id,
          status: updatedOrder!.status,
          total_amount: orderTotal,
          paid_amount: newTotalPaid,
          remaining_amount: orderTotal - newTotalPaid
        },
        user: updatedOrder!.get('user')
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pago:', error);
      throw error;
    }
  }

  async updatePayment(paymentId: number, updateData: {
    status?: string;
  }) {
    const { sequelize } = await import('../config/database');
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              },
              {
                model: Payment,
                as: 'payments',
                attributes: ['id_payment', 'amount', 'status']
              }
            ]
          }
        ],
        transaction
      });

      if (!payment) {
        await transaction.rollback();
        throw new Error('Pago no encontrado');
      }

      const order = payment.get('order') as any;
      const previousStatus = payment.status;

      if (previousStatus === 'Refunded' && updateData.status !== 'Refunded') {
        await transaction.rollback();
        throw new Error('No se puede modificar un pago reembolsado');
      }

      await payment.update(
        {
          status: updateData.status || payment.status
        },
        { transaction }
      );

      await transaction.commit();

      await this.orderService.recalculateOrderStatus(order.id_order);

      const updatedPayment = await this.getPaymentById(paymentId);
      return updatedPayment;

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar pago:', error);
      throw error;
    }
  }

  async deletePayment(paymentId: number) {
    const { sequelize } = await import('../config/database');
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(paymentId, { 
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id_order']
          }
        ],
        transaction 
      });

      if (!payment) {
        await transaction.rollback();
        throw new Error('Pago no encontrado');
      }

      if (payment.status === 'Completed') {
        await transaction.rollback();
        throw new Error('No se puede eliminar un pago completado. Use reembolso en su lugar.');
      }

      if (payment.status === 'Refunded') {
        await transaction.rollback();
        throw new Error('No se puede eliminar un pago reembolsado');
      }

      const order = payment.get('order') as any;
      const orderId = order.id_order;

      await payment.destroy({ transaction });
      await transaction.commit();

      await this.orderService.recalculateOrderStatus(orderId);

      return {
        success: true,
        message: 'Pago eliminado exitosamente',
        deletedPaymentId: paymentId
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}