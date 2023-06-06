import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

//@desc  Fetch all products
//@route GET /api/products
//@access Fetch all products

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 4;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};
  const count = await Product.count({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * page - 1);
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

//@desc  Fetch single products
//@route GET /api/products/:id
//@access PUBLIC Fetch all products

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

//@desc  Delete single products
//@route DELETE /api/products/:id
//@access PRIVATE/admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product Deleted' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

//@desc  Create a products
//@route POST /api/products/:id
//@access PRIVATE/admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample',
    price: 0,
    user: req.user._id,
    brand: 'brand Name',
    image: 'images/sample.jpg',
    category: 'Sample Brand',
    countInStock: 0,
    numReview: 0,
    description: 'Description Data',
  });
  const createProduct = await product.save();
  res.status(201).json(createProduct);
});
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  console.log(product);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed =
    product.reviews &&
    product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  console.log(alreadyReviewed);

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  if (!product.reviews) {
    product.reviews = [];
  }

  product.reviews.push(review);

  product.numReviews = product.reviews.length;

  const totalRating = product.reviews.reduce(
    (acc, item) => item.rating + acc,
    0
  );
  product.rating = totalRating / product.reviews.length;

  await product.save();

  res.status(201).json({ message: 'Review added' });
});
//@desc Get top rated products
//@route Get /api/products/top
//@access PUBLIC
const getTopProduct = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

export {
  getProductById,
  getProducts,
  deleteProduct,
  updateProduct,
  createProduct,
  createProductReview,
  getTopProduct,
};
