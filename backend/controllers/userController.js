const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const controller = {
  createUser: async (req, res) => {
    try {
      const { name, email } = req.body;

      const newUser = {
        id: uuidv4(),
        name,
        email,
        creation_date: admin.firestore.Timestamp.now(),
      };

      await db.collection("Users").doc(newUser.id).set(newUser);

      return res.status(201).send(newUser);
    } catch (err) {
      console.error("Error when creating a user: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const snapshot = await db.collection("Users").get();
      const users = snapshot.docs.map((doc) => doc.data());

      return res.status(200).send(users);
    } catch (err) {
      console.error("Error when returning the users: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;

      const userRef = db.collection("Users").doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "User not found." });
      }

      const user = doc.data();
      return res.status(200).send(user);
    } catch (err) {
      console.error("Error when returning a user: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  updateUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email } = req.body;

      const userRef = db.collection("Users").doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "User not found." });
      }

      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;

      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .send({ message: "No valid fields for updating." });
      }

      await userRef.update(updates);

      const updatedDoc = await userRef.get();
      return res.status(200).send(updatedDoc.data());
    } catch (err) {
      console.error("Error when updating a user: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const { userId } = req.params;

      const userRef = db.collection("Users").doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "User not found." });
      }

      await userRef.delete();
      return res.status(204).send({ message: "Project deleted successfully." });
    } catch (err) {
      console.error("Error when deleting a user: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },
};

module.exports = controller;
