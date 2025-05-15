const Availability = require('../models/availability.model');

exports.createAvailability = async (professorId, startTime, endTime) => {
  const availability = new Availability({
    professorId,
    startTime,
    endTime
  });
  return availability.save();
};

exports.getProfessorAvailabilities = async (professorId) => {
  return Availability.find({
    professorId,
    status: 'available'
  });
};

exports.removeAvailability = async (slotId, professorId) => {
  const availability = await Availability.findOneAndDelete({
    _id: slotId,
    professorId
  });
  if (!availability) {
    throw new Error('Availability not found');
  }
  return availability;
};