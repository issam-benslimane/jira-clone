import { Router } from "express";
import { issuesController } from "./handlers";
import { commentsRouter } from "../comments";
import { authenticate } from "../common/middlewares";

export const issuesRouter = Router({ mergeParams: true });

issuesRouter.use(authenticate);

issuesRouter.get("/", issuesController.getIssues);
issuesRouter.post("/", issuesController.createIssue);

issuesRouter.get("/:id", issuesController.getIssue);
issuesRouter.put("/:id", issuesController.updateIssue);
issuesRouter.delete("/:id", issuesController.deleteIssue);

issuesRouter.use("/:issueId/comments", commentsRouter);
