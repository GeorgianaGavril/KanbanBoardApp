const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const isMember = async (projectId, userId) => {
  const projectDoc = await db.collection("Projects").doc(projectId).get();
  const project = projectDoc.data();
  return projectDoc.exists && project.members_uids.includes(userId);
};

const controller = {
  createColumn: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, order } = req.body;
      //   const userUid = req.user.uid;
      const userUid = "E_HARDCODAT";

      if (!name) {
        return res
          .status(400)
          .send({ message: "Name of the column is mandatory." });
      }

      if (!(await isMember(projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "User is not a member of this project." });
      }

      const newColumn = {
        id: uuidv4(),
        projectId,
        name,
        order: order !== undefined ? order : 0,
      };

      await db.collection("Columns").doc(newColumn.id).set(newColumn);

      return res.status(201).send(newColumn);
    } catch (err) {
      console.error("Error when creating a column: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getColumnsByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      // const userUid = req.user.uid;
      const userUid = "E_HARDCODAT";

      if (!(await isMember(projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "User is not a member of this project." });
      }

      const snapshot = await db
        .collection("Columns")
        .where("projectId", "==", projectId)
        .orderBy("order", "asc")
        .get();

      const columns = snapshot.docs.map((doc) => doc.data());
      return res.status(200).send(columns);
    } catch (err) {
      console.error("Error when returning all columns: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  updateColumnById: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, order } = req.body;
      // const userUid = req.user.uid;
      const userUid = "E_HARDCODAT";

      const columnRef = db.collection("Columns").doc(id);
      const doc = await columnRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Column not found." });
      }

      const column = doc.data();

      if (!(await isMember(column.projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "User is not a member of this project." });
      }

      const updates = {};
      if (name) updates.name = name;
      if (order !== undefined) updates.order = order;

      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .send({ message: "No valid fields for updating." });
      }

      await columnRef.update(updates);

      const updatedDoc = await columnRef.get();
      return res.status(200).send(updatedDoc.data());
    } catch (err) {
      console.error("Error when updating a column: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  deleteColumnById: async (req, res) => {
    try {
      const { id } = req.params;
      // const userUid = req.user.uid;
      const userUid = "E_HARDCODAT";

      const columnRef = db.collection("Columns").doc(id);
      const doc = await columnRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Column not found." });
      }

      const column = doc.data();

      if (!(await isMember(column.projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "User is not a member of this project." });
      }

      await columnRef.delete();
      return res.status(204).send({ message: "Column deleted successfully." });
    } catch (err) {
      console.error("Error when deleting a column: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },
};

module.exports = controller;
