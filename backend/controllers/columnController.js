const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const controller = {
  createColumn: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, order } = req.body;

      if (!name) {
        return res
          .status(400)
          .send({ message: "Name of the column is mandatory." });
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

      const snapshot = await db
        .collection("Columns")
        .where("projectId", "==", projectId)
        .orderBy("order", "asc")
        .get();

      const columns = snapshot.docs.map((doc) => doc.data());

      const columnsWithTasks = await Promise.all(
        columns.map(async (column) => {
          const taskSnapshot = await db
            .collection("Tasks")
            .where("columnId", "==", column.id)
            .orderBy("order_in_column", "asc")
            .get();

          const tasks = taskSnapshot.docs.map((doc) => doc.data());

          return {
            ...column,
            tasks: tasks,
          };
        })
      );

      return res.status(200).send(columnsWithTasks);
    } catch (err) {
      console.error("Error when returning all columns: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  updateColumnById: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, order } = req.body;

      const columnRef = db.collection("Columns").doc(id);
      const doc = await columnRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Column not found." });
      }

      const column = doc.data();

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

      const columnRef = db.collection("Columns").doc(id);
      const doc = await columnRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Column not found." });
      }

      const column = doc.data();

      await columnRef.delete();
      return res.status(204).send({ message: "Column deleted successfully." });
    } catch (err) {
      console.error("Error when deleting a column: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },
};

module.exports = controller;
