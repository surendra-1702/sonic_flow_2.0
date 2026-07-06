const { Router } = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  create,
  getAll,
  getById,
  update,
  remove,
  addSong,
  removeSong,
} = require('../controllers/playlistController');

const router = Router();

router.use(auth);

router.get('/', getAll);
router.get('/:id', getById);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Playlist name is required')],
  validate,
  create
);

router.put('/:id', update);

router.delete('/:id', remove);

router.post('/:id/songs', addSong);
router.delete('/:id/songs/:songId', removeSong);

module.exports = router;
