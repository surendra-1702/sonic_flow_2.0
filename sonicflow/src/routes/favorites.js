const { Router } = require('express');
const auth = require('../middleware/auth');
const { getAll, add, remove } = require('../controllers/favoriteController');

const router = Router();

router.use(auth);

router.get('/', getAll);
router.post('/:songId', add);
router.delete('/:songId', remove);

module.exports = router;
