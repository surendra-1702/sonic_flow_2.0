const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  getAll,
  getById,
  search,
  getTrending,
  getRecentlyAdded,
  syncSongs,
} = require('../controllers/songController');

const router = Router();

router.get('/', getAll);
router.get('/search', search);
router.get('/trending', getTrending);
router.get('/recently-added', getRecentlyAdded);
router.post('/sync', auth, syncSongs);
router.get('/:id', getById);

module.exports = router;
