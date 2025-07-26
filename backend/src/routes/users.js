const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');

router.get('/', usersController.getAllUsers);
router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.get('/verify', auth, usersController.verifyToken);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router; 