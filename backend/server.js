import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import morgan from 'morgan';
dotenv.config();
// import cors from 'cors';

connectDB();
const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('Api is running');
  });
}
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

app.use(notFound);
app.use(errorHandler);
// app.use(cors());

// app.use(
//   cors({
//     origin: 'http://localhost:5173', // Replace with your allowed origin
//     methods: 'GET,POST', // Replace with your allowed methods
//     allowedHeaders: 'Content-Type,Authorization', // Replace with your allowed headers
//   })
// );

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `SERVER running on ${process.env.NODE_ENV} MODE listening on port ${PORT}`
  )
);
