const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  getQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  reorderQueue,
} = require('../controllers/queueController');

const router = Router();

router.use(auth);

router.get('/', getQueue);
router.post('/', addToQueue);
router.put('/reorder', reorderQueue);
router.delete('/clear', clearQueue);
router.delete('/:index', removeFromQueue);

module.exports = router;
