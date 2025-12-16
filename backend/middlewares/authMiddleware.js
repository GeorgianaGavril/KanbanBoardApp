const admin = require("firebase-admin");

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .send({ message: "Forbidden access. Missing token." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = { uid: decodedToken.uid };

    next();
  } catch (err) {
    return res.status(401).send({ message: "Expired or invalid token." });
  }
};

module.exports = { checkAuth };
