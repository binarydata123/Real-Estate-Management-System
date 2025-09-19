import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
