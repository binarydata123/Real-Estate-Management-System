import Agent from "../models/AgentModel.js";

export const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
