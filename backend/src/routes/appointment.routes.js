const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, appointmentController.createAppointment);
router.get('/', authenticate, appointmentController.getAppointments);
router.delete('/:appointmentId', authenticate, appointmentController.cancelAppointment);

module.exports = router;