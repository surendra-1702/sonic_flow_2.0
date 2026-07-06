const { Router } = require('express');
const { getAll, getById } = require('../controllers/artistController');

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;
