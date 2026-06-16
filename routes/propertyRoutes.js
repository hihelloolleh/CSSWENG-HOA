const express             = require('express');
const router              = express.Router();
const propertyController  = require('../controllers/propertyController');

// GET  /properties       → list all properties
// POST /properties       → create a new property      (SPRINT 2+)
// GET  /properties/:id   → view a single property     (SPRINT 2+)
// PUT  /properties/:id   → update a property          (SPRINT 2+)
// DELETE /properties/:id → delete a property          (SPRINT 2+)

router.get('/', propertyController.getProperties);

module.exports = router;
