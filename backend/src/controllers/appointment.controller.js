const appointmentService = require('../services/appointment.service');

exports.createAppointment = async (req, res) => {
  try {
    const { slotId, professorId } = req.body;
    const appointment = await appointmentService.createAppointment(
      req.user._id,
      professorId,
      slotId
    );
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getUserAppointments(
      req.user._id,
      req.user.role
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    await appointmentService.cancelAppointment(
      req.params.appointmentId,
      req.user._id,
      req.user.role
    );
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(error.message.includes('Unauthorized') ? 403 : 404)
      .json({ message: error.message });
  }
};