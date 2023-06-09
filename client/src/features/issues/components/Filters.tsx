import { Avatar, useUsers } from "@/features/users";
import { FiSearch } from "react-icons/fi";
import clsx from "clsx";
import { FilterState } from "../hooks";
import { useParams } from "react-router";

type FiltersProps = {
  filters: FilterState;
  updateFilters: <K extends keyof FilterState>(
    filter: Pick<FilterState, K>
  ) => void;
  areFiltersClear: () => boolean;
  clearFilters: () => void;
};

export const Filters = ({
  filters,
  updateFilters,
  areFiltersClear,
  clearFilters,
}: FiltersProps) => {
  const projectId = useParams().projectId as string;
  const { data: users } = useUsers({ projectId });

  return (
    <div className="my-8 flex items-center gap-4">
      <div className="grid grid-cols-[auto_1fr] items-center">
        <FiSearch className="z-50 col-start-1 col-end-3 row-start-1 row-end-2 w-8 text-slate-500" />
        <input
          type="text"
          value={filters.search}
          onChange={(ev) => updateFilters({ search: ev.target.value })}
          className="col-start-1 col-end-3 row-start-1 row-end-1 w-40 rounded-sm border border-slate-300 bg-slate-100 p-1 pl-8 text-sm text-slate-800"
        />
      </div>

      <div className="flex flex-row-reverse">
        {users?.map(({ id, avatarUrl }) => (
          <button
            key={id}
            onClick={() => updateFilters({ users: filters.users.concat(id) })}
            className={clsx(
              "rounded-full transition-transform hover:-translate-y-1",
              filters.users.includes(id) && "ring-4 ring-blue-700"
            )}
          >
            <Avatar
              size="md"
              avatarUrl={avatarUrl}
              className="ring-2 ring-white"
            />
          </button>
        ))}
      </div>

      <button
        onClick={() => updateFilters({ myIssue: !filters.myIssue })}
        className={clsx(
          "rounded-md px-3 py-2 text-sm transition-colors",
          !filters.myIssue && "text-slate-600 hover:bg-slate-100",
          filters.myIssue && "bg-blue-100 text-blue-800"
        )}
      >
        Only My Issues
      </button>

      <button
        onClick={() =>
          updateFilters({ recentlyUpdated: !filters.recentlyUpdated })
        }
        className={clsx(
          "rounded-md px-3 py-2 text-sm transition-colors",
          !filters.recentlyUpdated && "text-slate-600 hover:bg-slate-100",
          filters.recentlyUpdated && "bg-blue-100 text-blue-800"
        )}
      >
        Recently Updated
      </button>

      {!areFiltersClear() && (
        <button
          onClick={clearFilters}
          className="rounded-md border-l border-l-slate-300 px-3 py-2 text-sm text-slate-600 transition-colors hover:text-slate-500"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
