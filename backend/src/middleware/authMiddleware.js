import jwt from "jsonwebtoken";
import { User } from "../models/Common/UserModel.js";
import { Customer } from "../models/Agent/CustomerModel.js";

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

          // 3. Get user based on role from the token
          if (decoded.role === "customer") {
            req.user = await Customer.findById(decoded.userId).populate(
              "agencyId",
              "name slug email phone logoUrl"
            );

            // Auto logout if customer OR agency is deleted
            if (!req.user || req.user.isDeleted || !req.user.agencyId) {
              return res.status(401).json({
                forceLogout: true,
                message: "Your account has been removed by the agency.Please contact with agency",
              });   
            }
          } else {
            // For 'agent', 'admin', etc.
            req.user = await User.findById(decoded.userId)
              .select("-password")
              .populate("agencyId", "name slug email phone logoUrl");
          }

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
        return next();
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
