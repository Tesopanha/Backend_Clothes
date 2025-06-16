const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { validateColor, validateObjectIdParam } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Color Routes
router.post('/colors', [auth, validateColor], colorController.createColor);
router.get('/colors', colorController.getColors);
router.put('/colors/:id', [auth, validateObjectIdParam, validateColor], colorController.updateColor);
router.delete('/colors/:id', [auth, validateObjectIdParam], colorController.deleteColor);

module.exports = router;