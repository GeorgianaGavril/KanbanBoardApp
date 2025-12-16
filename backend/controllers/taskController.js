const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const hasProjectAccess = async (projectId, userId) => {
  const doc = await db.collection("Projects").doc(projectId).get();
  return doc.exists && doc.data().members_uids.includes(userId);
};

const controller = {
  createTask: async (req, res) => {
    try {
      const {
        projectId,
        columnId,
        title,
        description,
        deadline,
        order_in_column,
      } = req.body;
      const userUid = "E_HARDCODAT";

      if (!(await hasProjectAccess(projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "Forbidden: No access to this project." });
      }

      if (!title) {
        return res
          .status(400)
          .send({ message: "The title of the task is mandatory." });
      }

      const newTask = {
        id: uuidv4(),
        projectId,
        columnId,
        title,
        description: description || "",
        asignated_uids: [],
        deadline: deadline
          ? admin.firestore.Timestamp.fromDate(new Date(deadline))
          : null,
        order_in_column: order_in_column || 0,
        creation_date: admin.firestore.Timestamp.now(),
      };

      await db.collection("Tasks").doc(newTask.id).set(newTask);
      return res.status(201).send(newTask);
    } catch (err) {
      console.error("Error when creating a task: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getTasksByColumn: async (req, res) => {
    try {
      const { columnId } = req.params;
      const snapshot = await db
        .collection("Tasks")
        .where("columnId", "==", columnId)
        .orderBy("order_in_column", "asc")
        .get();

      const columns = snapshot.docs.map((doc) => doc.data());
      return res.status(200).send(columns);
    } catch (err) {
      console.error("Error when returning all tasks by column: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  updateTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userUid = "E_HARDCODAT";

      const taskRef = db.collection("Tasks").doc(id);
      const doc = await taskRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Task not found." });
      }

      const task = doc.data();

      if (!(await hasProjectAccess(task.projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "Forbidden: No access to this project." });
      }

      await taskRef.update(updates);
      return res.status(200).send((await taskRef.get()).data());
    } catch (err) {
      console.error("Error when updating a task: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  deleteTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const userUid = "E_HARDCODAT";

      const taskRef = db.collection("Tasks").doc(id);
      const doc = await taskRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Task not found." });
      }

      const task = doc.data();

      if (!(await hasProjectAccess(task.projectId, userUid))) {
        return res
          .status(403)
          .send({ message: "Forbidden: No access to this project." });
      }

      await taskRef.delete();
      return res.status(204).send({ message: "Task deleted successfully." });
    } catch (err) {
      console.error("Error when deleting a task: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },
};

module.exports = controller;
