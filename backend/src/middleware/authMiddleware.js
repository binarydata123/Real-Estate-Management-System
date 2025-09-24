import jwt from "jsonwebtoken";
import { User } from "../models/Common/UserModel.js";

/**
 * Middleware to protect routes by verifying a JWT and role.
 * Usage: protect(["admin", "coach"])
 */
const protect =
  (allowedRoles = []) =>
    async (req, res, next) => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          // 1. Get token from header
          token = req.headers.authorization.split(" ")[1]; // 2. Verify the token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // 3. Get user from the token's ID and attach to the request // We exclude the password from the user object for security
          req.user = await User.findById(decoded.userId).select("-password").populate('agencyId', 'name');
          if (!req.user) {
            return res
              .status(401)
              .json({ message: "Not authorized, user not found" });
          }

          // 4. Check role if roles are specified
          if (
            Array.isArray(allowedRoles) &&
            allowedRoles.length > 0 &&
            !allowedRoles.includes(req.user.role)
          ) {
            return res
              .status(403)
              .json({ message: "Forbidden: insufficient role permission" });
          }

          // 5. Proceed to next
          next();
        } catch (error) {
          console.error("Authentication error:", error.message);
          return res
            .status(401)
            .json({ message: "Not authorized, token failed" });
        }
      } else {
        return res
          .status(401)
          .json({ message: "Not authorized, no token provided" });
      }
    };

export { protect };
