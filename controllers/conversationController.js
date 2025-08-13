import conversationService from '../services/conversationService.js';

const addConversation = async (req, res) => {
    try{
        const {patient_id, doctor_id, last_message, last_message_time, created_at} = req.body;
        if (isNaN(patient_id) || isNaN(doctor_id) || 
            !last_message || !last_message_time || !created_at) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const boolResult = await conversationService.addConversation(patient_id,doctor_id, last_message, last_message_time, created_at);
        res.json({"result": boolResult})
    } catch (err) {
    console.error('Error in addConversation:', err);
    res.status(500).json({ error: err.message });
  }
}


const getUserMostRecentConversations = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const conversations = await conversationService.getUserMostRecentConversations(userId);
    res.json(conversations);
  } catch (err) {
    console.error('Error in getUserConversations:', err);
    res.status(500).json({ error: err.message });
  }
};


const getDoctorMostRecentConversations = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctorId ID' });
    }

    const conversations = await conversationService.getDoctorMostRecentConversations(doctorId);
    res.json(conversations);
  } catch (err) {
    console.error('Error in getDoctorMostRecentConversations:', err);
    res.status(500).json({ error: err.message });
  }
};

export {getUserMostRecentConversations, getDoctorMostRecentConversations, addConversation}
