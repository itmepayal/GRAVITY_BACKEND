import Role from "../models/role.model";
import logger from "../config/logger.config";

const systemRoles = [
  {
    name: "Owner",
    workspace: null,
    permissions: ["*"],
    isSystem: true,
  },

  {
    name: "Admin",
    workspace: null,
    permissions: [
      // Workspace
      "workspace:view",
      "workspace:update",
      "workspace:delete",

      // Project
      "project:create",
      "project:view",
      "project:update",
      "project:delete",

      // Members
      "member:add",
      "member:update",
      "member:remove",

      // Boards
      "board:create",
      "board:view",
      "board:update",
      "board:delete",

      // Sprints
      "sprint:create",
      "sprint:view",
      "sprint:update",
      "sprint:delete",

      // Tasks
      "task:create",
      "task:view",
      "task:update",
      "task:delete",
      "task:archive",
      "task:assign",

      // Comments
      "task:manage_comments",

      "task:watch",
      "task:attachment",
      "task:hours",

      // Teams
      "team:create",
      "team:view",
      "team:update",
      "team:delete",
      "team:members:add",
      "team:members:remove",
      "team:lead:change",
    ],
    isSystem: true,
  },

  {
    name: "Member",
    workspace: null,
    permissions: [
      // Workspace
      "workspace:view",

      // Project
      "project:view",

      // Board
      "board:view",

      // Sprint
      "sprint:view",

      // Tasks
      "task:create",
      "task:view",
      "task:update",

      // Optional
      "task:assign",
      "task:archive",

      // Team
      "team:view",
    ],
    isSystem: true,
  },

  {
    name: "Viewer",
    workspace: null,
    permissions: [
      "workspace:view",
      "project:view",
      "board:view",
      "sprint:view",
      "task:view",
      "team:view",
    ],
    isSystem: true,
  },
];

export const seedRoles = async () => {
  try {
    logger.info("Role seeding started...");

    for (const role of systemRoles) {
      const exists = await Role.findOne({
        name: role.name,
        workspace: null,
      });

      if (exists) {
        logger.info(`Role already exists: ${role.name}`);
        continue;
      }

      await Role.create(role);
      logger.info(`Role created successfully: ${role.name}`);
    }

    logger.info("All system roles seeded successfully.");
  } catch (error) {
    logger.error("Role seeding failed:", error);
    throw error;
  }
};
