import db from "@/db";
import {
  TIssueCreate,
  TIssueUpdateDto,
  TIssueWhere,
  TIssueWhereUnique,
} from "./types";
import { IssueStatus, Prisma } from "@prisma/client";
import { omit } from "@/shared/utils";

const getIssues = async (where: TIssueWhere) => {
  const issues = await db.issue.findMany({
    where,
    include: {
      reporter: true,
      assignees: {
        select: {
          assignee: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return issues.map((issue) => ({
    ...issue,
    assignees: issue.assignees.map((e) => e.assignee),
  }));
};

const getIssue = async (where: TIssueWhereUnique) => {
  const [issue] = await getIssues(where);
  return issue;
};

const createIssue = async ({ assigneesIds, ...props }: TIssueCreate) => {
  const status = IssueStatus.backlog;
  const issue = await db.issue.create({
    data: {
      ...props,
      status,
      assignees: {
        createMany: {
          data: assigneesIds.map((id) => ({ assigneeId: id })),
        },
      },
    },
  });
  return issue;
};

const updateIssue = async (id: number, props: TIssueUpdateDto) => {
  const query: Prisma.IssueUpdateArgs = {
    where: { id },
    data: omit(props, "assignees", "reporter"),
  };
  if (props.assignees)
    Object.assign(query.data, {
      assignees: {
        deleteMany: {},
        createMany: {
          data: props.assignees.map(({ id }) => ({ assigneeId: id })),
        },
      },
    });
  if (props.reporter)
    Object.assign(query.data, {
      reporterId: props.reporter.id,
    });

  const issue = await db.issue.update(query);
  return issue;
};

const deleteIssue = async (where: TIssueWhereUnique) => {
  await db.issue.delete({ where });
};

export const issuesService = {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
};
