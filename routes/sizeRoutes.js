const express = require('express');
const router = express.Router();
const sizeController = require('../controllers/sizeController');
const { validateSize, validateObjectIdParam } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Size Routes
router.post('/sizes', [auth, validateSize], sizeController.createSize);
router.get('/sizes', sizeController.getSizes);
router.put('/sizes/:id', [auth, validateObjectIdParam, validateSize], sizeController.updateSize);
router.delete('/sizes/:id', [auth, validateObjectIdParam], sizeController.deleteSize);

module.exports = router;