import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // console.log(req.user._id);
    const order = new Order({
      user: req.user,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    // console.log(order);
    try {
      const createdOrder = await order.save();
      console.log(createdOrder);
      res.status(201).json(createdOrder);
    } catch (error) {
      console.error(error);
      // Handle the error and send an appropriate response
      res.status(500).json({ message: 'Error creating order' });
    }
  }
});

// @desc    Create new order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  // console.log('runnung getOrderById');
  // console.log(req.params.id);
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );
  console.log('order is access at controller line 57', order);
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  console.log('runnung updateOrderToPaid');
  // console.log(req.params.id);
  const order = await Order.findById(req.params.id);
  console.log(order);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
    console.log(order.paymentResult);
    const updateOrder = await order.save();
    console.log('updateOrder in DB');
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  console.log();
  res.json(orders);
});
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  console.log('runnung updateOrderToDelivered');
  // console.log(req.params.id);
  const order = await Order.findById(req.params.id);
  console.log(order);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    console.log(order.paymentResult);
    const updateOrder = await order.save();
    console.log('updateOrder in DB');
    res.json(updateOrder);
  } else {
    res.status(404);
    throw new Error('Order not Found');
  }
});

export {
  updateOrderToDelivered,
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
};
