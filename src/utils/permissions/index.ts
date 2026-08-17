export const memberHasPermission = (
  workspace: any,
  userId: string,
  requiredPermission: string,
): boolean => {
  if (!workspace) return false;

  const ownerId = workspace.owner?._id
    ? workspace.owner._id.toString()
    : workspace.owner?.toString();

  if (ownerId === userId) return true;

  const member = workspace.members?.find((m: any) => {
    if (!m || !m.user) return false;
    const memberUserId = m.user?._id
      ? m.user._id.toString()
      : m.user?.toString();
    return memberUserId === userId;
  });

  if (!member || !member.role) return false;

  const permissions: string[] = member.role.permissions || [];
  return permissions.includes("*") || permissions.includes(requiredPermission);
};

export const getMemberRole = (workspace: any, userId: string) => {
  const ownerId = workspace.owner?._id
    ? workspace.owner._id.toString()
    : workspace.owner?.toString();

  if (ownerId === userId) return { name: "Owner", permissions: ["*"] };

  const member = workspace.members?.find((m: any) => {
    const memberUserId = m.user?._id
      ? m.user._id.toString()
      : m.user?.toString();
    return memberUserId === userId;
  });

  return member?.role || null;
};
