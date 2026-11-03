import { Router } from "express";

import * as tasksController from "../controllers/tasks.js";

const router = Router();

router.get("/", tasksController.getTasks);
router.post("/", tasksController.createTask);
router.patch("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);

export default router;