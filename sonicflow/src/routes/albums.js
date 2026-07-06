const { Router } = require('express');
const { getAll, getById } = require('../controllers/albumController');

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;
