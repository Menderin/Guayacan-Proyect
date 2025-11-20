import { User, Order, Payment, OrderDetail, Shipping } from '../models';
import Producto from '../models/productoModels';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderFilters {
  startDate?: Date | string;
  endDate?: Date | string;
  userId?: number;
  userEmail?: string;
  productSku?: string;
  status?: string;
  page?: number;
  limit?: number;
}

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

export interface RefundRequest {
  orderId: number;
  reason: string;
  refundAmount?: number; // Opcional: si es reembolso parcial
  adminUserId: number; // Usuario admin que procesa el reembolso
}

export interface RefundResult {
  success: boolean;
  message: string;
  refundDetails: {
    orderId: number;
    previousStatus: string;
    newStatus: string;
    refundedAmount: number;
    productsRestocked: Array<{
      sku: string;
      name: string;
      quantityRestored: number;
      newStock: number;
    }>;
    paymentsUpdated: number;
  };
}

export class OrderService {
  
  // ========================================
  // MÉTODO HELPER: Enriquecer órdenes con productos de MongoDB
  // ========================================
  private async enrichOrdersWithProducts(orders: any[]): Promise<OrderWithDetails[]> {
    // Obtener todos los SKUs únicos
    const allSkus = new Set<string>();
    orders.forEach(order => {
      const details = Array.isArray(order.details) ? order.details : 
                      order.get ? order.get('details') : [];
      details.forEach((detail: any) => allSkus.add(detail.product_sku));
    });

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

  // ========================================
  // MÉTODOS PARA CLIENTES (requieren userId)
  // ========================================
  
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

    // ✅ Enriquecer con productos de MongoDB
    const ordersWithProducts = await this.enrichOrdersWithProducts(
      orders.map(o => ({ ...o.toJSON(), user }))
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      totalOrders: orders.length,
      orders: ordersWithProducts
    };
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderWithDetails> {
    const order = await Order.findOne({
      where: { 
        id_order: orderId, 
        user_id: userId 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
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
      ]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // ✅ Enriquecer con productos de MongoDB
    const [enrichedOrder] = await this.enrichOrdersWithProducts([order]);
    return enrichedOrder;
  }

  async getPersonalOrdersByStatus(userId: number, status: string) {
    const orders = await Order.findAll({
      where: { 
        user_id: userId,
        status 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
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

    // ✅ Enriquecer con productos de MongoDB
    return await this.enrichOrdersWithProducts(orders);
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

  // ========================================
  // MÉTODOS PARA ADMINISTRADORES
  // ========================================

  async getAllOrders() {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
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

    // ✅ Enriquecer con productos de MongoDB
    return await this.enrichOrdersWithProducts(orders);
  }

  async getOrderDetailsById(orderId: number): Promise<OrderWithDetails> {
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
      ]
    });

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // ✅ Enriquecer con productos de MongoDB
    const [enrichedOrder] = await this.enrichOrdersWithProducts([order]);
    return enrichedOrder;
  }

  async getOrdersByStatus(status: string) {
    const orders = await Order.findAll({
      where: { status },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
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

    // ✅ Enriquecer con productos de MongoDB
    return await this.enrichOrdersWithProducts(orders);
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

  // ========================================
  // FILTROS AVANZADOS (tu método principal)
  // ========================================

  async getOrdersWithFilters(filters: OrderFilters) {
    const {
      startDate,
      endDate,
      userId,
      userEmail,
      productSku,
      status,
      page = 1,
      limit = 10
    } = filters;

    const whereConditions: any = {};
    const userWhereConditions: any = {};

    // Filtro por fecha
    if (startDate || endDate) {
      whereConditions.order_date = {};
      if (startDate) {
        whereConditions.order_date[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.order_date[Op.lte] = new Date(endDate);
      }
    }

    // Filtro por estado
    if (status) {
      whereConditions.status = status;
    }

    // Filtro por usuario
    if (userId) {
      whereConditions.user_id = userId;
    }

    if (userEmail) {
      userWhereConditions.email = {
        [Op.iLike]: `%${userEmail}%`
      };
    }

    // Filtro por producto
    if (productSku) {
      const orderDetails = await OrderDetail.findAll({
        where: {
          product_sku: {
            [Op.iLike]: `%${productSku}%`
          }
        },
        attributes: ['order_id'],
        raw: true
      });

      const orderIdsFromProduct = [...new Set(orderDetails.map(d => d.order_id))];
      
      if (orderIdsFromProduct.length === 0) {
        return {
          orders: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        };
      }

      whereConditions.id_order = {
        [Op.in]: orderIdsFromProduct
      };
    }

    const offset = (page - 1) * limit;

    // Consultar orders
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
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
        },
        {
          model: Shipping,
          as: 'shipping',
          attributes: ['id_shipping', 'address', 'city', 'status', 'transport_company', 'shipping_date'],
          required: false
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id_payment', 'amount', 'payment_method', 'status', 'payment_date'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['order_date', 'DESC']],
      distinct: true
    });

    // ✅ Enriquecer con productos de MongoDB
    const ordersWithProducts = await this.enrichOrdersWithProducts(orders);

    return {
      orders: ordersWithProducts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // ========================================
  // NUEVO: RESUMEN Y ESTADÍSTICAS
  // ========================================

  async getOrdersSummary(filters: OrderFilters) {
    const { orders } = await this.getOrdersWithFilters({
      ...filters,
      limit: 10000 // Obtener todos para estadísticas
    });

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      averageOrderValue: 0,
      statusBreakdown: {} as Record<string, number>,
      topProducts: [] as Array<{ 
        sku: string; 
        name: string; 
        totalQuantity: number; 
        totalRevenue: number 
      }>,
      topCustomers: [] as Array<{ 
        userId: number; 
        name: string; 
        email: string; 
        totalOrders: number; 
        totalSpent: number 
      }>
    };

    // Calcular promedio
    summary.averageOrderValue = orders.length > 0 
      ? summary.totalRevenue / orders.length 
      : 0;

    // Contar por estado
    orders.forEach(order => {
      summary.statusBreakdown[order.status] = 
        (summary.statusBreakdown[order.status] || 0) + 1;
    });

    // Top productos
    const productStats = new Map<string, { 
      name: string; 
      quantity: number; 
      revenue: number 
    }>();
    
    orders.forEach(order => {
      order.details.forEach(detail => {
        const current = productStats.get(detail.product_sku) || { 
          name: detail.product?.name || 'Producto Desconocido', 
          quantity: 0, 
          revenue: 0 
        };
        current.quantity += detail.quantity;
        current.revenue += detail.subtotal;
        productStats.set(detail.product_sku, current);
      });
    });

    summary.topProducts = Array.from(productStats.entries())
      .map(([sku, stats]) => ({
        sku,
        name: stats.name,
        totalQuantity: stats.quantity,
        totalRevenue: stats.revenue
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Top clientes
    const customerStats = new Map<number, { 
      name: string; 
      email: string; 
      orders: number; 
      spent: number 
    }>();
    
    orders.forEach(order => {
      const current = customerStats.get(order.user_id) || {
        name: order.user.name,
        email: order.user.email,
        orders: 0,
        spent: 0
      };
      current.orders += 1;
      current.spent += order.total_amount;
      customerStats.set(order.user_id, current);
    });

    summary.topCustomers = Array.from(customerStats.entries())
      .map(([userId, stats]) => ({
        userId,
        name: stats.name,
        email: stats.email,
        totalOrders: stats.orders,
        totalSpent: stats.spent
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return summary;
  }


  // ========================================
  // GESTIÓN DE REEMBOLSOS
  // ========================================

  /**
   * Procesar reembolso completo de un pedido
   * 1. Verifica que el pedido exista y pueda ser reembolsado
   * 2. Actualiza el estado del pedido a "Cancelled"
   * 3. Actualiza los pagos a "Refunded"
   * 4. Restaura el stock de los productos en MongoDB
   * 5. Registra la operación
   */
  async processRefund(refundRequest: RefundRequest): Promise<RefundResult> {
    const transaction = await sequelize.transaction();

    try {
      const { orderId, reason, refundAmount, adminUserId } = refundRequest;

      // 1. Obtener el pedido completo
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
            attributes: ['id_payment', 'payment_method', 'amount', 'status']
          },
          {
            model: OrderDetail,
            as: 'details',
            attributes: ['id_detail_order', 'product_sku', 'quantity', 'price']
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        throw new Error('Pedido no encontrado');
      }

      // Verificar que el pedido puede ser reembolsado
      if (order.status === 'Cancelled') {
        await transaction.rollback();
        throw new Error('Este pedido ya ha sido cancelado previamente');
      }

      if (order.status === 'Refunded') {
        await transaction.rollback();
        throw new Error('Este pedido ya ha sido reembolsado');
      }

      const previousStatus = order.status;
      const orderDetails = order.get('details') as any[];
      const payments = order.get('payments') as any[];

      // 2. Actualizar estado del pedido a "Cancelled"
      await order.update(
        { 
          status: 'Cancelled',
        },
        { transaction }
      );

      // ✅✅ NUEVO: Cancelar también el envío asociado
      const orderWithShipping = await Order.findByPk(orderId, {
        include: [
          {
            model: Shipping,
            as: 'shipping',
            attributes: ['id_shipping', 'status']
          }
        ],
        transaction
      });

      const shipping = orderWithShipping?.get('shipping') as any;

      if (shipping && shipping.status !== 'Cancelled') {
        await Shipping.update(
          { status: 'Cancelled' },
          { 
            where: { id_shipping: shipping.id_shipping },
            transaction 
          }
        );
        console.log(`✅ Envío #${shipping.id_shipping} cancelado automáticamente durante reembolso`);
      }

      // 3. Actualizar pagos a "Refunded"
      const totalRefunded = refundAmount || order.total_amount;
      let paymentsUpdated = 0;

      for (const payment of payments) {
        if (payment.status !== 'Refunded') {
          await Payment.update(
            { 
              status: 'Refunded',
            },
            { 
              where: { id_payment: payment.id_payment },
              transaction 
            }
          );
          paymentsUpdated++;
        }
      }

      // 4. Restaurar stock en MongoDB
      const productsRestocked: Array<{
        sku: string;
        name: string;
        quantityRestored: number;
        newStock: number;
      }> = [];

      for (const detail of orderDetails) {
        const product = await Producto.findOne({ sku: detail.product_sku });

        if (product) {
          const previousStock = product.stock;
          const newStock = previousStock + detail.quantity;

          await Producto.updateOne(
            { sku: detail.product_sku },
            { 
              $inc: { stock: detail.quantity },
              $set: { 
                in_stock: true
              }
            }
          );

          productsRestocked.push({
            sku: product.sku,
            name: product.name,
            quantityRestored: detail.quantity,
            newStock: newStock
          });
        } else {
          console.warn(`Producto con SKU ${detail.product_sku} no encontrado en MongoDB`);
        }
      }

      // Confirmar transacción
      await transaction.commit();

      return {
        success: true,
        message: 'Reembolso procesado exitosamente',
        refundDetails: {
          orderId: order.id_order,
          previousStatus: previousStatus,
          newStatus: 'Cancelled',
          refundedAmount: totalRefunded,
          productsRestocked: productsRestocked,
          paymentsUpdated: paymentsUpdated
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Verificar si un pedido puede ser reembolsado
   */
  async canBeRefunded(orderId: number): Promise<{
    canRefund: boolean;
    reason?: string;
    order?: any;
  }> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Payment,
          as: 'payments'
        },
        {
          model: OrderDetail,
          as: 'details'
        }
      ]
    });

    if (!order) {
      return {
        canRefund: false,
        reason: 'Pedido no encontrado'
      };
    }

    if (order.status === 'Cancelled') {
      return {
        canRefund: false,
        reason: 'El pedido ya está cancelado'
      };
    }

    if (order.status === 'Refunded') {
      return {
        canRefund: false,
        reason: 'El pedido ya ha sido reembolsado'
      };
    }

    // Verificar si hay pagos
    const payments = order.get('payments') as any[];
    if (!payments || payments.length === 0) {
      return {
        canRefund: false,
        reason: 'No hay pagos asociados a este pedido'
      };
    }

    // Verificar si todos los pagos ya están reembolsados
    const allRefunded = payments.every(p => p.status === 'Refunded');
    if (allRefunded) {
      return {
        canRefund: false,
        reason: 'Todos los pagos ya han sido reembolsados'
      };
    }

    return {
      canRefund: true,
      order: order
    };
  }

  /**
   * Obtener historial de reembolsos (si tienes tabla de logs)
   */
  async getRefundHistory(orderId?: number) {
    // Si implementas tabla RefundLog:
    // const refunds = await RefundLog.findAll({
    //   where: orderId ? { order_id: orderId } : {},
    //   include: [
    //     { model: Order, as: 'order' },
    //     { model: User, as: 'admin_user' }
    //   ],
    //   order: [['refund_date', 'DESC']]
    // });
    // return refunds;

    // Por ahora, buscar pedidos cancelados
    const whereCondition = orderId 
      ? { id_order: orderId, status: 'Cancelled' }
      : { status: 'Cancelled' };

    const cancelledOrders = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Payment,
          as: 'payments',
          where: { status: 'Refunded' },
          required: false
        },
        {
          model: OrderDetail,
          as: 'details'
        }
      ],
      order: [['order_date', 'DESC']]
    });

    return cancelledOrders;
  }

  /**
   * Reembolso parcial (por si necesitas reembolsar solo algunos productos)
   */
  async processPartialRefund(
    orderId: number,
    productSkus: string[],
    reason: string,
    adminUserId: number
  ): Promise<RefundResult> {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderDetail,
            as: 'details',
            where: {
              product_sku: {
                [Op.in]: productSkus
              }
            }
          },
          {
            model: Payment,
            as: 'payments'
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        throw new Error('Pedido no encontrado');
      }

      const details = order.get('details') as any[];
      let refundAmount = 0;
      const productsRestocked: Array<{
        sku: string;
        name: string;
        quantityRestored: number;
        newStock: number;
      }> = [];

      // Calcular monto a reembolsar y restaurar stock
      for (const detail of details) {
        refundAmount += parseFloat(detail.price) * detail.quantity;

        const product = await Producto.findOne({ sku: detail.product_sku });
        if (product) {
          const newStock = product.stock + detail.quantity;
          
          await Producto.updateOne(
            { sku: detail.product_sku },
            { 
              $inc: { stock: detail.quantity },
              $set: { in_stock: true }
            }
          );

          productsRestocked.push({
            sku: product.sku,
            name: product.name,
            quantityRestored: detail.quantity,
            newStock: newStock
          });
        }
      }

      // Actualizar monto total del pedido
      const newTotal = order.total_amount - refundAmount;
      await order.update(
        { total_amount: newTotal },
        { transaction }
      );

      // Si el reembolso parcial cubre todo, cancelar el pedido
      if (newTotal <= 0) {
        await order.update(
          { status: 'Cancelled' },
          { transaction }
        );
      }

      await transaction.commit();

      return {
        success: true,
        message: 'Reembolso parcial procesado exitosamente',
        refundDetails: {
          orderId: order.id_order,
          previousStatus: order.status,
          newStatus: newTotal <= 0 ? 'Cancelled' : order.status,
          refundedAmount: refundAmount,
          productsRestocked: productsRestocked,
          paymentsUpdated: 0
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Debe ser llamado desde:
   * - PaymentController después de crear/actualizar pagos
   * - ShippingController después de actualizar envíos
   */
  async recalculateOrderStatus(orderId: number): Promise<{
    previousStatus: string;
    newStatus: string;
    changed: boolean;
    message: string;
  }> {
    const transaction = await sequelize.transaction();

    try {
      // ========================================
      // 1. OBTENER PEDIDO CON TODA LA INFO
      // ========================================
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Payment,
            as: 'payments',
            attributes: ['id_payment', 'amount', 'status']
          },
          {
            model: Shipping,
            as: 'shipping',
            attributes: ['id_shipping', 'status']
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        throw new Error('Pedido no encontrado');
      }

      const previousStatus = order.status;

      // No recalcular si el pedido está cancelado
      if (previousStatus === 'Cancelled') {
        await transaction.rollback();
        return {
          previousStatus,
          newStatus: previousStatus,
          changed: false,
          message: 'Pedido cancelado, no se recalcula estado'
        };
      }

      // ========================================
      // 2. CALCULAR ESTADO DE PAGO
      // ========================================
      const payments = order.get('payments') as any[];
      const totalPaid = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const orderTotal = parseFloat(order.total_amount.toString());
      const isFullyPaid = totalPaid >= orderTotal;
      const hasAnyPayment = totalPaid > 0;

      // ========================================
      // 3. OBTENER ESTADO DE ENVÍO
      // ========================================
      const shipping = order.get('shipping') as any;
      const shippingStatus = shipping?.status || null;

      // ========================================
      // 4. DETERMINAR NUEVO ESTADO DEL PEDIDO
      // ========================================
      let newStatus = previousStatus;

      // REGLA 1: Pedido completamente pagado Y envío entregado = Completed
      if (isFullyPaid && shippingStatus === 'Delivered') {
        newStatus = 'Completed';
      }
      // REGLA 2: Pedido completamente pagado Y envío en tránsito = Shipped
      else if (isFullyPaid && shippingStatus === 'Shipped') {
        newStatus = 'Shipped';
      }
      // REGLA 3: Pedido completamente pagado pero envío pendiente = Processing
      else if (isFullyPaid) {
        newStatus = 'Processing';
      }
      // REGLA 4: Tiene pagos parciales = Processing
      else if (hasAnyPayment) {
        newStatus = 'Processing';
      }
      // REGLA 5: Sin pagos completados = Pending
      else {
        newStatus = 'Pending';
      }

      // ========================================
      // 5. ACTUALIZAR SI CAMBIÓ
      // ========================================
      const changed = previousStatus !== newStatus;
      
      if (changed) {
        await order.update({ status: newStatus }, { transaction });
      }

      await transaction.commit();

      return {
        previousStatus,
        newStatus,
        changed,
        message: changed 
          ? `Estado actualizado de "${previousStatus}" a "${newStatus}"`
          : `Estado permanece en "${newStatus}"`
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error al recalcular estado del pedido:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: number, 
    newStatus: string,
    force: boolean = false
  ): Promise<{ 
    success: boolean; 
    message: string; 
    order?: any 
  }> {
    const validStatuses = [
      'Pending', 
      'Processing', 
      'Shipped', 
      'Completed', 
      'Cancelled'
    ];

    // Validar estado
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: `Estado inválido. Los estados válidos son: ${validStatuses.join(', ')}`
      };
    }

    const transaction = await sequelize.transaction();

    try {
      // Buscar pedido con envío y pagos incluidos
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Payment,
            as: 'payments',
            attributes: ['id_payment', 'amount', 'status']
          },
          {
            model: Shipping,
            as: 'shipping',
            attributes: ['id_shipping', 'status']
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Pedido no encontrado'
        };
      }

      const previousStatus = order.status;

      // Validaciones de transiciones (si no es forzado)
      if (!force) {
        // No permitir cambiar pedidos cancelados
        if (previousStatus === 'Cancelled' && newStatus !== 'Cancelled') {
          await transaction.rollback();
          return {
            success: false,
            message: 'No se puede cambiar el estado de un pedido cancelado'
          };
        }

        // Advertir si se intenta marcar como completado sin estar pagado
        const payments = order.get('payments') as any[];
        const totalPaid = payments
          .filter((p: any) => p.status === 'Completed')
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);
        const orderTotal = parseFloat(order.total_amount.toString());

        if (newStatus === 'Completed' && totalPaid < orderTotal) {
          await transaction.rollback();
          return {
            success: false,
            message: 'No se puede marcar como completado un pedido que no está totalmente pagado. Use force=true para omitir esta validación.'
          };
        }
      }

      // Actualizar estado del pedido
      await order.update({ status: newStatus }, { transaction });

      let additionalMessage = '';

      // Si el pedido se cancela
      if (newStatus === 'Cancelled') {
        const shipping = order.get('shipping') as any;
        const payments = order.get('payments') as any[];

        // 1. Cancelar el envío
        if (shipping && shipping.status !== 'Cancelled') {
          await Shipping.update(
            { status: 'Cancelled' },
            { 
              where: { id_shipping: shipping.id_shipping },
              transaction 
            }
          );
          console.log(`Envío #${shipping.id_shipping} cancelado automáticamente`);
          additionalMessage += ' Envío cancelado.';
        }

        // 2. Actualizar pagos según su estado actual
        let paymentsUpdated = 0;
        for (const payment of payments) {
          // Si el pago estaba completado -> Refunded (ya se cobró)
          if (payment.status === 'Completed') {
            await Payment.update(
              { status: 'Refunded' },
              { 
                where: { id_payment: payment.id_payment },
                transaction 
              }
            );
            paymentsUpdated++;
            console.log(`Pago #${payment.id_payment} marcado como Refunded`);
          }
          // Si el pago estaba pendiente -> Cancelled (nunca se procesó)
          else if (payment.status === 'Pending') {
            await Payment.update(
              { status: 'Cancelled' },
              { 
                where: { id_payment: payment.id_payment },
                transaction 
              }
            );
            paymentsUpdated++;
            console.log(`Pago #${payment.id_payment} marcado como Cancelled`);
          }
        }

        if (paymentsUpdated > 0) {
          additionalMessage += ` ${paymentsUpdated} pago(s) actualizados.`;
        }
      }

      // Confirmar transacción
      await transaction.commit();

      return {
        success: true,
        message: `Estado del pedido actualizado de "${previousStatus}" a "${newStatus}".${additionalMessage}`,
        order
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  // ========================================
  // CREAR NUEVO PEDIDO
  // ========================================

  async createOrder(orderData: {
    userId: number;
    products: Array<{ sku: string; quantity: number }>;
    paymentMethod: string;
    shippingAddress?: {
      address: string;
      city: string;
      transportCompany?: string;
    };
    status?: string;
  }) {
    const transaction = await sequelize.transaction();

    try {
      const { userId, products, paymentMethod, shippingAddress, status = 'Pending' } = orderData;

      // ========================================
      // 1. VALIDAR USUARIO
      // ========================================
      const user = await User.findByPk(userId);
      if (!user) {
        await transaction.rollback();
        throw new Error('Usuario no encontrado');
      }

      // ========================================
      // 2. VALIDAR Y OBTENER PRODUCTOS DE MONGODB
      // ========================================
      const productDetails: Array<{
        sku: string;
        name: string;
        price: number;
        stock: number;
        quantity: number;
      }> = [];

      let totalAmount = 0;

      for (const item of products) {
        const product = await Producto.findOne({ sku: item.sku });

        if (!product) {
          await transaction.rollback();
          throw new Error(`Producto con SKU "${item.sku}" no encontrado`);
        }

        // Validar stock disponible
        if (product.stock < item.quantity) {
          await transaction.rollback();
          throw new Error(
            `Stock insuficiente para "${product.name}". ` +
            `Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }

        // Validar cantidad positiva
        if (item.quantity <= 0) {
          await transaction.rollback();
          throw new Error(`La cantidad debe ser mayor a 0 para el producto "${product.name}"`);
        }

        productDetails.push({
          sku: product.sku,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: item.quantity
        });

        totalAmount += product.price * item.quantity;
      }

      // ========================================
      // 3. CREAR ORDEN EN POSTGRESQL
      // ========================================
      const order = await Order.create(
        {
          user_id: userId,
          status: status,
          total_amount: totalAmount,
          order_date: new Date()
        },
        { transaction }
      );

      // ========================================
      // 4. CREAR DETALLES DEL PEDIDO
      // ========================================
      const orderDetailsData = productDetails.map(product => ({
        order_id: order.id_order,
        product_sku: product.sku,
        quantity: product.quantity,
        price: product.price
      }));

      const createdDetails = await OrderDetail.bulkCreate(orderDetailsData, { transaction });

      // ========================================
      // 5. ACTUALIZAR STOCK EN MONGODB
      // ========================================
      for (const product of productDetails) {
        await Producto.updateOne(
          { sku: product.sku },
          {
            $inc: { stock: -product.quantity }
          }
        );
      }

      // ========================================
      // 6. CREAR PAGO
      // ========================================
      const payment = await Payment.create(
        {
          order_id: order.id_order,
          payment_method: paymentMethod,
          amount: totalAmount,
          status: 'Pending',
          payment_date: new Date()
        },
        { transaction }
      );

      // ========================================
      // 7. CREAR ENVÍO (SI SE PROPORCIONA)
      // ========================================
      let shipping = null;
      if (shippingAddress) {
        shipping = await Shipping.create(
          {
            order_id: order.id_order,
            address: shippingAddress.address,
            city: shippingAddress.city,
            transport_company: shippingAddress.transportCompany || 'Por definir',
            status: 'Processing',
            shipping_date: new Date()
          },
          { transaction }
        );
      }

      // ========================================
      // 8. CONFIRMAR TRANSACCIÓN
      // ========================================
      await transaction.commit();

      // ========================================
      // 9. FORMATEAR RESPUESTA
      // ========================================
      return {
        order: {
          id_order: order.id_order,
          user_id: order.user_id,
          order_date: order.order_date,
          status: order.status,
          total_amount: parseFloat(order.total_amount.toString())
        },
        details: createdDetails.map((detail, index) => ({
          id_detail_order: detail.id_detail_order,
          product_sku: detail.product_sku,
          product_name: productDetails[index].name,
          quantity: detail.quantity,
          price: parseFloat(detail.price.toString()),
          subtotal: parseFloat(detail.price.toString()) * detail.quantity
        })),
        payment: {
          id_payment: payment.id_payment,
          payment_method: payment.payment_method,
          amount: parseFloat(payment.amount.toString()),
          status: payment.status
        },
        shipping: shipping ? {
          id_shipping: shipping.id_shipping,
          address: shipping.address,
          city: shipping.city,
          status: shipping.status,
          transport_company: shipping.transport_company
        } : undefined,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }

}