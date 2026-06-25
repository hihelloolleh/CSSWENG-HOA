const express            = require('express');
const router             = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/',            propertyController.getProperties);
router.post('/',           propertyController.createProperty);
router.post('/:id/update', propertyController.updateProperty);
router.post('/:id/delete', propertyController.deleteProperty);

module.exports = router;
