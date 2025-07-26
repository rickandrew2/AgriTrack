const Product = require('../models/products');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const { Parser: CsvParser } = require('json2csv');
const { logProductActivity } = require('../utils/logActivity');

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
    console.log('Create product request:', {
      body: req.body,
      file: req.file
    });

    // Handle both JSON and FormData
    const name = req.body?.name;
    const category = req.body?.category;
    const quantity = req.body?.quantity;
    const storageArea = req.body?.storageArea;
    let imageUrl = '';

    // Validate required fields
    if (!name || !category || !quantity || !storageArea) {
      return res.status(400).json({ error: 'Name, category, quantity, and storage area are required' });
    }

    // Check if product already exists (by name only)
    const existingProduct = await Product.findOne({ name });
    
    if (existingProduct) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({ 
        error: `Product with name "${name}" already exists. Please use a different name or update the existing product.` 
      });
    }

    // Create new product
      // Handle image upload if file exists
      if (req.file) {
        try {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'agritrack-products',
            use_filename: true,
            unique_filename: true
          });

          imageUrl = result.secure_url;

          // Delete the temporary file
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // Delete the temporary file if it exists
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(500).json({ error: 'Failed to upload image' });
        }
      }
      
      const product = new Product({
        name,
        category,
        quantity,
        storageArea,
        imageUrl
      });

      await product.save();
      
      // Log the activity
      await logProductActivity(
        req.user,
        'add_product',
        product,
        `Added product: ${product.name} (Quantity: ${product.quantity})`
      );
      
      res.status(201).json({ 
        product, 
        message: 'Product added successfully',
        action: 'added'
      });
  } catch (err) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update product request:', {
      id: req.params.id,
      body: req.body,
      file: req.file,
      headers: req.headers['content-type']
    });

    // Handle both JSON and FormData
    const name = req.body?.name;
    const category = req.body?.category;
    const quantity = req.body?.quantity;
    const storageArea = req.body?.storageArea;
    let imageUrl = req.body?.imageUrl || '';
    
    // Validate product ID
    if (!req.params.id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Validate required fields
    if (!name || !category || !quantity || !storageArea) {
      return res.status(400).json({ error: 'Name, category, quantity, and storage area are required' });
    }

    // Check if product name already exists (excluding the current product being updated)
    console.log('Checking for duplicate name:', name, 'excluding product ID:', req.params.id);
    const existingProduct = await Product.findOne({ 
      name: name,
      _id: { $ne: req.params.id } // Exclude the current product from the check
    });
    
    console.log('Existing product found:', existingProduct);
    
    if (existingProduct) {
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.log('Duplicate name detected, rejecting update');
      return res.status(400).json({ 
        error: `Product with name "${name}" already exists. Please use a different name.` 
      });
    }

    // Handle image upload if file exists
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'agritrack-products',
          use_filename: true,
          unique_filename: true
        });

        imageUrl = result.secure_url;

        // Delete the temporary file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Delete the temporary file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'Failed to upload image' });
      }
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
    
    // Log the activity
    await logProductActivity(
      req.user,
      'update_product',
      product,
      `Updated product: ${product.name} (Quantity: ${product.quantity})`
    );
    
    res.json(product);
  } catch (err) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
    
    // Log the activity
    await logProductActivity(
      req.user,
      'delete_product',
      product,
      `Deleted product: ${product.name}`
    );
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
};

// Import products from CSV/XLSX
exports.importProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filePath = req.file.path;
  const ext = filePath.split('.').pop().toLowerCase();
  let rows = [];
  let errors = [];
  let added = 0;
  let updated = 0;

  try {
    if (ext === 'csv') {
      // Parse CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      // Parse Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    for (const row of rows) {
      // Expecting: name, category, quantity, storageArea, imageUrl (optional)
      const name = row.name?.trim();
      const category = row.category?.trim();
      const quantity = parseInt(row.quantity);
      const storageArea = row.storageArea?.trim();
      const imageUrl = row.imageUrl?.trim() || '';
      if (!name || !category || !quantity || !storageArea) {
        errors.push({ row, error: 'Missing required fields' });
        continue;
      }
      // Check if product exists (by name only)
      const existing = await Product.findOne({ name });
      if (existing) {
        // Update existing product
        existing.quantity += quantity;
        existing.category = category; // Update category
        existing.storageArea = storageArea; // Update storage area
        if (imageUrl) existing.imageUrl = imageUrl;
        await existing.save();
        updated++;
      } else {
        // Create new product
        const newProduct = new Product({ name, category, quantity, storageArea, imageUrl });
        await newProduct.save();
        added++;
      }
    }
    fs.unlinkSync(filePath);
    res.json({ added, updated, errors });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: err.message });
  }
};

// Export products as CSV or XLSX
exports.exportProducts = async (req, res) => {
  try {
    console.log('Export request received:', { format: req.query.format });
    const products = await Product.find();
    console.log('Products found:', products.length);
    const format = req.query.format === 'xlsx' ? 'xlsx' : 'csv';
    const filename = `products_export.${format}`;
    console.log('Exporting as:', format);
    
    if (format === 'csv') {
      // Use json2csv for CSV export
      const fields = ['name', 'category', 'quantity', 'storageArea', 'imageUrl'];
      const parser = new CsvParser({ fields });
      const csv = parser.parse(products);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      return res.send(csv);
    } else {
      // Use xlsx for Excel export
      const data = products.map(p => ({
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        storageArea: p.storageArea,
        imageUrl: p.imageUrl || ''
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=\"${filename}\"`);
      return res.send(buffer);
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
};
