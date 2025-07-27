const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    const { fullName, email, password, role } = req.body;
    
    console.log('Registration attempt:', { fullName, email, role, password: password ? '***' : 'undefined' });

    // Validate required fields
    if (!fullName || !email || !password) {
      console.log('Missing required fields:', { fullName: !!fullName, email: !!email, password: !!password });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role if provided
    if (role && !['staff', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be either "staff" or "admin"' });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    console.log('Existing user check by email:', existingUserByEmail ? 'User found' : 'No user found');
    
    if (existingUserByEmail) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if user already exists by name
    const existingUserByName = await User.findOne({ name: fullName });
    console.log('Existing user check by name:', existingUserByName ? 'User found' : 'No user found');
    
    if (existingUserByName) {
      console.log('User already exists with name:', fullName);
      return res.status(400).json({ error: 'User already exists with this name' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user with specified role or default to 'staff'
    const userRole = role ? role.toLowerCase() : 'staff';
    console.log('Creating user with role:', userRole);
    
    const user = new User({
      name: fullName,
      email,
      passwordHash,
      role: userRole
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Validate role
    if (!['staff', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be either "staff" or "admin"' });
    }

    // Check if email is already taken by another user
    const existingUserByEmail = await User.findOne({ email, _id: { $ne: id } });
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }

    // Check if name is already taken by another user
    const existingUserByName = await User.findOne({ name, _id: { $ne: id } });
    if (existingUserByName) {
      return res.status(400).json({ error: 'Name is already taken by another user' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role: role.toLowerCase() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin user
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    // The auth middleware has already verified the token and set req.user
    // We just need to return the user info
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 