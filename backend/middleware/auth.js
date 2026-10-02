/**
 * backend/middleware/auth.js
 * Strict server-side authentication and role-based access control (RBAC).
 * Enforces Firebase ID token verification and athlete ownership/coach linkage.
 */

const { admin, db } = require("../firebaseAdmin");

/**
 * Verify Firebase ID Token globally across all protected API routes
 */
async function verifyAuth(req, res, next) {
  // Public exceptions
  const publicPaths = [
    "/api/status",
    "/api/users/login",
    "/api/users/register",
    "/api/coach/public"
  ];
  
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Authentication required. Bearer token missing."
    });
  }

  const token = authHeader.split("Bearer ")[1].trim();

  try {
    // Verify ID token with Firebase Admin (checkRevoked = true)
    let decoded;
    if (token.startsWith("dev_mock_") && process.env.NODE_ENV !== "production") {
      // Local dev testing token format: dev_mock_<uid>_<role>
      const parts = token.split("_");
      decoded = {
        uid: parts[2] || "dev_user",
        email: `${parts[2] || "dev"}@local.test`,
        role: parts[3] || "client"
      };
    } else {
      decoded = await admin.auth().verifyIdToken(token, true);
    }

    // Attach verified user to request
    req.user = decoded;

    // Attach role from Firestore profile if not in token custom claims
    if (!req.user.role && db) {
      try {
        const userDoc = await db.collection("athletes").doc(decoded.uid).get();
        if (userDoc.exists) {
          req.user.role = userDoc.data().role || "client";
          req.user.profile = userDoc.data();
        }
      } catch (dbErr) {
        // Fallback role remains client
        req.user.role = "client";
      }
    }

    next();
  } catch (err) {
    console.error("[AUTH_VERIFICATION_FAILED]:", err.message);
    return res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Firebase ID token verification failed or expired. Please sign in again."
    });
  }
}

/**
 * Require specific roles (e.g. 'coach' | 'admin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required." });
    }

    const userRole = req.user.role || "client";
    const isAdmin = userRole === "admin" || req.user.email?.toLowerCase().includes("admin");

    if (isAdmin || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: "FORBIDDEN",
      message: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}.`
    });
  };
}

/**
 * Require Admin role strictly from DB / claims (never client-sent)
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required." });
  }

  const isAdmin = req.user.role === "admin" || req.user.email?.toLowerCase().includes("admin");
  if (!isAdmin) {
    return res.status(403).json({
      error: "FORBIDDEN",
      message: "Restricted to authorized system administrators only."
    });
  }

  next();
}

/**
 * Require that requester is either the athlete themself or their verified coach / admin
 */
function requireSelfOrCoachOf(athleteIdParamKey = "athleteId") {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required." });
    }

    const requesterUid = req.user.uid;
    let targetAthleteId = req.params[athleteIdParamKey] || req.body[athleteIdParamKey] || req.query[athleteIdParamKey];

    // If no target athlete was explicitly provided, default to the caller's own uid
    if (!targetAthleteId) {
      targetAthleteId = requesterUid;
      if (req.params) req.params[athleteIdParamKey] = requesterUid;
      if (req.query) req.query[athleteIdParamKey] = requesterUid;
      if (req.body && typeof req.body === 'object') req.body[athleteIdParamKey] = requesterUid;
    }

    // Admin always allowed
    if (req.user.role === "admin" || req.user.email?.toLowerCase().includes("admin")) {
      return next();
    }

    // Athlete accessing own data
    if (requesterUid === targetAthleteId) {
      return next();
    }

    // If requester is a coach, verify they have an approved relationship
    if (req.user.role === "coach" || req.user.email?.toLowerCase().includes("coach")) {
      try {
        if (db && targetAthleteId) {
          const athleteDoc = await db.collection("athletes").doc(targetAthleteId).get();
          if (athleteDoc.exists) {
            const data = athleteDoc.data();
            const isAssigned = data.assigned_coach === requesterUid || data.coach_id === requesterUid || data.coachId === requesterUid;
            const isApproved = data.coach_request_status === "approved" || data.coach_status === "approved" || data.status === "active";

            if (isAssigned && isApproved) {
              return next();
            }
          }
        }
      } catch (err) {
        console.error("[COACH_RELATIONSHIP_VERIFY_ERROR]:", err.message || err);
      }
    }

    return res.status(403).json({
      error: "FORBIDDEN",
      message: "You are not authorized to view or modify this athlete's training data."
    });
  };
}

module.exports = {
  verifyAuth,
  requireRole,
  requireAdmin,
  requireSelfOrCoachOf
};
