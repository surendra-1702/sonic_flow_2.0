const { Router } = require('express');
const auth = require('../middleware/auth');
const { addHistory, getHistory } = require('../controllers/historyController');

const router = Router();

router.use(auth);

router.get('/', getHistory);
router.post('/', addHistory);

module.exports = router;
