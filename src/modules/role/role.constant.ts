export const roleName = ["owner", "admin", "member", "viewer"];

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
