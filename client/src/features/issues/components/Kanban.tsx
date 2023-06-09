import { IssueStatus } from "../constants";
import { TIssue } from "../types";
import { Filters } from "./Filters";
import { keys } from "@/utils/object-keys";
import { KanbanCol } from "./KanbanCol";
import { FilterState, useFilters, useGetIssues } from "../hooks";
import { useParams } from "react-router";
import { useAuth } from "@/features/auth";
import { TUser } from "@/features/users";

export const Kanban = () => {
  const projectId = useParams().projectId as string;
  const { data: issues, status } = useGetIssues(projectId);
  const { filters, ...methods } = useFilters();
  const { currentUser } = useAuth();

  if (status !== "success") return null;

  return (
    <>
      <Filters filters={filters} {...methods} />
      <div className="grid grid-cols-[repeat(4,minmax(200px,1fr))] gap-4">
        {keys(IssueStatus)
          .map((status) => ({
            status: IssueStatus[status],
            issues: filterByStatus(
              filterIssues(issues, filters, currentUser as TUser),
              IssueStatus[status]
            ),
          }))
          .map((props) => (
            <KanbanCol key={props.status} {...props} />
          ))}
      </div>
    </>
  );
};

function filterIssues(issues: TIssue[], filters: FilterState, user: TUser) {
  return issues.filter((issue) => {
    return keys(filters).every((key) => {
      if (key === "search") return issue.summary.includes(filters[key]);
      else if (key === "users" && filters[key].length > 0)
        return issue.assignees.find((assignee) =>
          filters[key].includes(assignee.id)
        );
      else if (key === "myIssue" && filters[key])
        return issue.assignees.find((assignee) => assignee.id === user.id);
      else if (key === "recentlyUpdated" && filters[key]) {
        const onDayAgo = Date.now() - 1000 * 60 * 60 * 24;
        return new Date(onDayAgo) < new Date(issue.updatedAt);
      } else return true;
    });
  });
}

function filterByStatus(issues: TIssue[], status: IssueStatus) {
  return issues.filter((issue) => issue.status === status);
}
