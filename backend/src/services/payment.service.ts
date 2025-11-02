import { User, Order, OrderDetail, Shipping } from '../models';
import Producto from '../models/productoModels';
import Payment from '../models/paymentModel';
import { Op } from 'sequelize';

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
  /**
   * Enriquecer órdenes con información de productos de MongoDB
   */
  private async enrichOrdersWithProducts(orders: any[]): Promise<OrderWithDetails[]> {
    // Obtener todos los SKUs únicos
    const allSkus = new Set<string>();
    orders.forEach(order => {
      const details = Array.isArray(order.details) ? order.details : 
                      order.get ? order.get('details') : [];
      details.forEach((detail: any) => allSkus.add(detail.product_sku));
    });

    // Si no hay SKUs, retornar array vacío
    if (allSkus.size === 0) {
      return orders.map(order => {
        const orderJson = typeof order.toJSON === 'function' ? order.toJSON() : order;
        return {
          ...orderJson,
          details: []
        };
      });
    }

    // Buscar productos en MongoDB
    const products = await Producto.find({
      sku: { $in: Array.from(allSkus) }
    }).select('sku name category stock images').lean();

    // Crear mapa de productos
    const productsMap = new Map(products.map(p => [p.sku, p]));

    // Formatear órdenes
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

  /**
   * Enriquecer pagos con información de productos de MongoDB
   */
  private async enrichPaymentsWithProducts(payments: any[]): Promise<PaymentWithDetails[]> {
    // Obtener todos los SKUs únicos de los detalles de las órdenes
    const allSkus = new Set<string>();
    payments.forEach(payment => {
      const order = payment.order || payment.get?.('order');
      if (order) {
        const details = Array.isArray(order.details) ? order.details : 
                        order.get ? order.get('details') : [];
        details.forEach((detail: any) => allSkus.add(detail.product_sku));
      }
    });

    // Si no hay SKUs, retornar sin productos
    let productsMap = new Map();
    if (allSkus.size > 0) {
      // Buscar productos en MongoDB
      const products = await Producto.find({
        sku: { $in: Array.from(allSkus) }
      }).select('sku name category stock images').lean();

      // Crear mapa de productos
      productsMap = new Map(products.map(p => [p.sku, p]));
    }

    // Formatear pagos
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

        // ✅ Obtener usuario desde order.user en lugar de payment.user
        // Porque en la BD, payments no tiene relación directa con users
        userInfo = paymentJson.order.user || null;
      }

      return {
        id_payment: paymentJson.id_payment,
        order_id: paymentJson.order_id,
        amount: parseFloat(paymentJson.amount),
        payment_method: paymentJson.payment_method,
        status: paymentJson.status,
        payment_date: paymentJson.payment_date,
        user: userInfo, // ✅ Usuario obtenido de la orden
        order: orderWithProducts!
      };
    });
  }

  // ========================================
  // MÉTODOS PARA ADMINISTRADORES
  // ========================================
  
  /**
   * Obtener todos los pagos (Admin)
   */
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

    // ✅ Enriquecer con productos de MongoDB
    return this.enrichPaymentsWithProducts(payments);
  }

  /**
   * Obtener pagos por estado (Admin)
   */
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

    // ✅ Enriquecer con productos de MongoDB y retornar
    return this.enrichPaymentsWithProducts(payments);
  }

  /**
   * Obtener pagos con filtros (Admin)
   */
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

    // Filtro por fecha
    if (startDate || endDate) {
      whereConditions.payment_date = {};
      if (startDate) {
        whereConditions.payment_date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.payment_date[Op.lte] = new Date(endDate);
      }
    }

    // Filtro por estado
    if (status) {
      whereConditions.status = status;
    }

    // Filtro por método de pago
    if (paymentMethod) {
      whereConditions.payment_method = paymentMethod;
    }

    // Filtro por monto
    if (minAmount !== undefined || maxAmount !== undefined) {
      whereConditions.amount = {};
      if (minAmount !== undefined) {
        whereConditions.amount[Op.gte] = minAmount;
      }
      if (maxAmount !== undefined) {
        whereConditions.amount[Op.lte] = maxAmount;
      }
    }

    // ✅ Filtro por usuario - debe ir en el include de Order -> User
    const userWhereConditions: any = {};
    if (userId) {
      userWhereConditions.id = userId;
    }

    const offset = (page - 1) * limit;

    // Consultar pagos
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id_order', 'order_date', 'status', 'total_amount', 'user_id'],
          required: true, // ✅ INNER JOIN para asegurar que exista la orden
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

    // ✅ Enriquecer con productos de MongoDB
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

  /**
   * Obtener pago por ID (Admin)
   */
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

    // ✅ Enriquecer con productos de MongoDB
    const enrichedPayments = await this.enrichPaymentsWithProducts([payment]);
    return enrichedPayments[0];
  }

  /**
   * Obtener estadísticas de pagos (Admin)
   */
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
      
      // Contar por estado
      stats.byStatus[paymentJson.status] = (stats.byStatus[paymentJson.status] || 0) + 1;
      
      // Contar por método
      stats.byMethod[paymentJson.payment_method] = (stats.byMethod[paymentJson.payment_method] || 0) + 1;
      
      // Sumar monto total
      stats.totalAmount += parseFloat(paymentJson.amount.toString());
    });

    return stats;
  }

  /**
   * Obtener pagos de un pedido específico
   * Retorna solo los pagos asociados a un pedido en particular
   */
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

    // Si no hay pagos, retornar array vacío
    if (!payments || payments.length === 0) {
      return [];
    }

    // Enriquecer con productos de MongoDB
    return this.enrichPaymentsWithProducts(payments);
  }


  // ========================================
  // CREAR NUEVO PAGO
  // ========================================

  /**
   * Crear un nuevo pago asociado a un pedido
   * Valida que el pedido exista y calcula montos pagados/pendientes
   */
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

      // ========================================
      // 1. VALIDAR PEDIDO
      // ========================================
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

      // Verificar que el pedido no esté cancelado
      if (order.status === 'Cancelled') {
        await transaction.rollback();
        throw new Error('No se puede registrar un pago para un pedido cancelado');
      }

      // ========================================
      // 2. CALCULAR MONTOS
      // ========================================
      const payments = order.get('payments') as any[];
      
      // Calcular total ya pagado (solo pagos completados)
      const totalPaid = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const orderTotal = parseFloat(order.total_amount.toString());
      const remainingAmount = orderTotal - totalPaid;

      // Validar que el monto no exceda lo pendiente
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

      // Validar monto positivo
      if (amount <= 0) {
        await transaction.rollback();
        throw new Error('El monto debe ser mayor a 0');
      }

      // ========================================
      // 3. CREAR PAGO
      // ========================================
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

      // ========================================
      // 4. ACTUALIZAR ESTADO DEL PEDIDO SI CORRESPONDE
      // ========================================
      const newTotalPaid = totalPaid + (status === 'Completed' ? amount : 0);

      if (status === 'Completed') {
        // Si el pago completa el total, marcar pedido como completado
        if (newTotalPaid >= orderTotal) {
          await order.update(
            { status: 'Completed' },
            { transaction }
          );
        } else {
          // Si hay pago parcial, marcar como "Processing"
          await order.update(
            { status: 'Processing' },
            { transaction }
          );
        }
      }

      // ========================================
      // 5. CONFIRMAR TRANSACCIÓN
      // ========================================
      await transaction.commit();

      // ========================================
      // 6. FORMATEAR RESPUESTA
      // ========================================
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
          id_order: order.id_order,
          user_id: order.user_id,
          status: order.status,
          total_amount: orderTotal,
          paid_amount: status === 'Completed' ? newTotalPaid : totalPaid,
          remaining_amount: status === 'Completed' ? orderTotal - newTotalPaid : remainingAmount
        },
        user: order.get('user')
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pago:', error);
      throw error;
    }
  }

  // ========================================
  // ACTUALIZAR PAGO EXISTENTE
  // ========================================

  /**
   * Actualizar el estado de un pago existente
   * Útil para confirmar pagos pendientes o marcar pagos fallidos
   */
  async updatePayment(paymentId: number, updateData: {
    status?: string;
  }) {
    const { sequelize } = await import('../config/database');
    const transaction = await sequelize.transaction();

    try {
      // ========================================
      // 1. BUSCAR PAGO
      // ========================================
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

      // ========================================
      // 2. VALIDACIONES
      // ========================================
      const previousStatus = payment.status;

      // No permitir actualizar pagos ya reembolsados
      if (previousStatus === 'Refunded' && updateData.status !== 'Refunded') {
        await transaction.rollback();
        throw new Error('No se puede modificar un pago reembolsado');
      }

      // ========================================
      // 3. ACTUALIZAR PAGO
      // ========================================
      await payment.update(
        {
          status: updateData.status || payment.status
        },
        { transaction }
      );

      // ========================================
      // 4. ACTUALIZAR ESTADO DEL PEDIDO SI CORRESPONDE
      // ========================================
      if (updateData.status === 'Completed' && previousStatus !== 'Completed') {
        const payments = order.payments as any[];
        
        const totalPaid = payments
          .filter((p: any) => p.status === 'Completed' || p.id_payment === paymentId)
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);

        const orderTotal = parseFloat(order.total_amount.toString());

        if (totalPaid >= orderTotal) {
          await Order.update(
            { status: 'Completed' },
            { where: { id_order: order.id_order }, transaction }
          );
        } else {
          await Order.update(
            { status: 'Processing' },
            { where: { id_order: order.id_order }, transaction }
          );
        }
      }

      // Si el pago falla, mantener el pedido en Pending si no hay otros pagos
      if (updateData.status === 'Failed') {
        const payments = order.payments as any[];
        const hasCompletedPayments = payments.some(
          (p: any) => p.status === 'Completed' && p.id_payment !== paymentId
        );

        if (!hasCompletedPayments) {
          await Order.update(
            { status: 'Pending' },
            { where: { id_order: order.id_order }, transaction }
          );
        }
      }

      // ========================================
      // 5. CONFIRMAR TRANSACCIÓN
      // ========================================
      await transaction.commit();

      // ========================================
      // 6. OBTENER DATOS ACTUALIZADOS
      // ========================================
      const updatedPayment = await this.getPaymentById(paymentId);
      return updatedPayment;

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar pago:', error);
      throw error;
    }
  }

  // ========================================
  // ELIMINAR PAGO (SOLO SI ESTÁ PENDIENTE)
  // ========================================

  /**
   * Eliminar un pago pendiente o fallido
   * Solo se pueden eliminar pagos con estado "Pending" o "Failed"
   */
  async deletePayment(paymentId: number) {
    const { sequelize } = await import('../config/database');
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(paymentId, { transaction });

      if (!payment) {
        await transaction.rollback();
        throw new Error('Pago no encontrado');
      }

      // Solo permitir eliminar pagos pendientes o fallidos
      if (payment.status === 'Completed') {
        await transaction.rollback();
        throw new Error('No se puede eliminar un pago completado. Use reembolso en su lugar.');
      }

      if (payment.status === 'Refunded') {
        await transaction.rollback();
        throw new Error('No se puede eliminar un pago reembolsado');
      }

      await payment.destroy({ transaction });
      await transaction.commit();

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