const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

const controller = {
  createProject: async (req, res) => {
    try {
      const { name, description } = req.body;
      const owner_uid = "E_HARDCODAT";

      if (!name) {
        return res
          .status(400)
          .send({ message: "The name of the project is mandatory." });
      }

      const newProject = {
        id: uuidv4(),
        name,
        description: description || "",
        status: "Active",
        owner_uid,
        members_uids: [owner_uid],
        creation_date: admin.firestore.Timestamp.now(),
      };

      await db.collection("Projects").doc(newProject.id).set(newProject);

      return res.status(201).send(newProject);
    } catch (err) {
      console.error("Error when creating project: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getProjectsByMember: async (req, res) => {
    try {
      const userUid = req.user.uid;

      const snapshot = await db
        .collection("Projects")
        .where("members_uids", "array-contains", userUid)
        .get();

      const projects = snapshot.docs.map((doc) => doc.data());

      return res.status(200).send(projects);
    } catch (err) {
      console.error("Eroare when returning the projects: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userUid = req.user.uid;

      const projectRef = db.collection("Projects").doc(projectId);
      const doc = await projectRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Project not found." });
      }

      const project = doc.data();

      if (!project.members_uids.includes(userUid)) {
        return res
          .status(403)
          .send({ message: "Unauthorized access to this project." });
      }

      return res.status(200).send(project);
    } catch (err) {
      console.error("Error when returning the project: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  updateProjectById: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, description, status } = req.body;
      // const userUid = req.user.uid;

      const projectRef = db.collection("Projects").doc(projectId);
      const doc = await projectRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Project not found." });
      }

      // if (project.owner_uid !== userUid) {
      //   return res.status(403).send({
      //     message: "You don't have the permission to edit this project.",
      //   });
      // }

      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (status) updates.status = status;

      if (Object.keys(updates).length === 0) {
        return res
          .status(400)
          .send({ message: "No valid fields for updating." });
      }

      await projectRef.update(updates);

      const updatedDoc = await projectRef.get();
      return res.status(200).send(updatedDoc.data());
    } catch (err) {
      console.error("Error when updating the project: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },

  deleteProjectById: async (req, res) => {
    try {
      const { projectId } = req.params;
      // const userUid = req.user.uid;

      const projectRef = db.collection("Projects").doc(projectId);
      const doc = await projectRef.get();

      if (!doc.exists) {
        return res.status(404).send({ message: "Project not found." });
      }

      // if (owner_uid !== userUid) {
      //   return res.status(401).send({ message: "Unauthorized access for this project"});
      // }

      await projectRef.delete();

      return res.status(204).send({ message: "Project deleted succesfully." });
    } catch (err) {
      console.error("Error when deleting a project: ", err);
      return res.status(500).send({ message: "Server error." });
    }
  },
};

module.exports = controller;
