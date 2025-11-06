import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "365d", // Set token to expire in 1 year
  });
};

export default generateToken;
