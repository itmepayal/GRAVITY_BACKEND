export interface GetProjectTasksQuery {
  status?: string;
  priority?: string;
  assignee?: string;
  isArchived?: string;
}
