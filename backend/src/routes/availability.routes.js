const express = require('express');
const { body } = require('express-validator');
const availabilityController = require('../controllers/availability.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', [
  authenticate,
  authorize(['professor']),
  body('startTime').isISO8601(),
  body('endTime').isISO8601()
], availabilityController.addAvailability);

router.get('/:professorId', authenticate, availabilityController.getProfessorAvailability);

router.delete('/:slotId', [
  authenticate,
  authorize(['professor'])
], availabilityController.removeAvailability);

module.exports = router;