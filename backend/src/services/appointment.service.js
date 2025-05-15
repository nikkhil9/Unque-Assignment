const Appointment = require('../models/appointment.model');
const Availability = require('../models/availability.model');

exports.createAppointment = async (studentId, professorId, slotId) => {
  const availability = await Availability.findOne({
    _id: slotId,
    status: 'available'
  });
  
  if (!availability) {
    throw new Error('Slot not available');
  }

  const appointment = new Appointment({
    studentId,
    professorId,
    slotId
  });

  availability.status = 'booked';
  await availability.save();
  return appointment.save();
};

exports.getUserAppointments = async (userId, role) => {
  const query = role === 'student' 
    ? { studentId: userId }
    : { professorId: userId };
  
  return Appointment.find(query)
    .populate('studentId', 'name email')
    .populate('professorId', 'name email');
};

exports.cancelAppointment = async (appointmentId, userId, role) => {
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (!canCancelAppointment(appointment, userId, role)) {
    throw new Error('Unauthorized');
  }

  appointment.status = 'cancelled';
  await appointment.save();

  const availability = await Availability.findById(appointment.slotId);
  if (availability) {
    availability.status = 'available';
    await availability.save();
  }

  return appointment;
};

function canCancelAppointment(appointment, userId, role) {
  if (role === 'student') {
    return appointment.studentId.toString() === userId.toString();
  }
  return appointment.professorId.toString() === userId.toString();
}