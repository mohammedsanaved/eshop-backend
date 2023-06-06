import jwt from 'jsonwebtoken';
// import User from '../models/orderModel.js';
import User from '../models/userModel.js';

import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res, next) => {
  // console.log('reached protect');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //   console.log(decoded);
      req.user = await User.findById(decoded.id);
      // console.log(req.user._id);

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not Auth , No Token');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token ');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not Authorized as an Admin');
  }
};
export { protect, admin };
