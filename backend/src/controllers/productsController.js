const Product = require('../models/products');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, quantity, storageArea, imageUrl } = req.body;
    
    const product = new Product({
      name,
      category,
      quantity,
      storageArea,
      imageUrl
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update product request:', {
      id: req.params.id,
      body: req.body
    });

    const { name, category, quantity, storageArea, imageUrl } = req.body;
    
    // Validate product ID
    if (!req.params.id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        quantity,
        storageArea,
        imageUrl,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product updated successfully:', product);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('Delete product request:', {
      id: req.params.id
    });

    // Validate product ID
    if (!req.params.id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product deleted successfully:', product);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
};
