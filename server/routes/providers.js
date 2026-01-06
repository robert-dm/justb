const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getMyProvider
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProviders);
router.get('/my-profile', protect, authorize('provider'), getMyProvider);
router.get('/:id', getProvider);
router.post('/', protect, authorize('provider', 'admin'), createProvider);
router.put('/:id', protect, authorize('provider', 'admin'), updateProvider);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteProvider);

module.exports = router;
