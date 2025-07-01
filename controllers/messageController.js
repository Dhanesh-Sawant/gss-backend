const MessageService = require('../services/messageService');

const getMessagesBetweenDoctorAndPatient = async (req, res) => {
  try {
    const doctorId = parseInt(req.query.doctor_id);
    const patientId = parseInt(req.query.patient_id);
    
    if (isNaN(doctorId) || isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid doctor or patient ID' });
    }

    const messages = await MessageService.getMessagesBetweenDoctorAndPatient(doctorId, patientId);
    res.json(messages);
  } catch (err) {
    console.error('Error in getMessagesBetweenDoctorAndPatient:', err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {getMessagesBetweenDoctorAndPatient}
