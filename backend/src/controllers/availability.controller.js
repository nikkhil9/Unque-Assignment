const availabilityService = require('../services/availability.service');

exports.addAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const availability = await availabilityService.createAvailability(
      req.user._id,
      startTime,
      endTime
    );
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfessorAvailability = async (req, res) => {
  try {
    const availabilities = await availabilityService.getProfessorAvailabilities(req.params.professorId);
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeAvailability = async (req, res) => {
  try {
    await availabilityService.removeAvailability(req.params.slotId, req.user._id);
    res.json({ message: 'Availability removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};