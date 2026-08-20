import swaggerJsdoc from "swagger-jsdoc";
import { serverConfig } from "./index";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Gravity Task Management System API",
      version: "1.0.0",
      description:
        "Comprehensive REST API documentation for the Gravity Task Management System. Provides complete management for Authentication, Users, Workspaces, Projects, Boards, Sprints, Tasks, Teams, Roles, Goals, Invitations, and Activity Logs.",
    },

    servers: [
      {
        url: `${serverConfig.API_URL}/api/v1`,
        description:
          serverConfig.NODE_ENV === "production"
            ? "Production server"
            : "Local development server",
      },
    ],

    tags: [
      {
        name: "Health",
        description: "API health and server status endpoints",
      },
      {
        name: "Authentication",
        description: "Authentication, register, login, OTP, and 2FA APIs",
      },
      {
        name: "Users",
        description: "User profile, password update, and account management APIs",
      },
      {
        name: "Workspaces",
        description:
          "Workspace management APIs including members, projects, roles, and settings",
      },
      {
        name: "Projects",
        description:
          "Project management APIs including members, status tracking, boards, and tasks",
      },
      {
        name: "Boards",
        description: "Kanban and Scrum Board management APIs",
      },
      {
        name: "Sprints",
        description: "Sprint lifecycle management APIs",
      },
      {
        name: "Tasks",
        description:
          "Task management APIs including subtasks, comments, watchers, attachments, and hours tracking",
      },
      {
        name: "Teams",
        description: "Team management APIs including team leads and member assignments",
      },
      {
        name: "Roles",
        description: "Custom and system permission roles management APIs",
      },
      {
        name: "Goals",
        description: "Workspace goal tracking and task linking APIs",
      },
      {
        name: "Invitations",
        description:
          "Workspace invitation APIs via email and invite links",
      },
      {
        name: "Activity Logs",
        description: "Audit trail and activity history logging APIs for workspaces and entities",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT access token. Example: eyJhbGciOiJIUzI1NiIs...",
        },
      },

      schemas: {
        // --------------------------------
        // COMMON ENVELOPES
        // --------------------------------

        ApiErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Invalid credentials or unauthorized access.",
            },
            errors: {
              type: "array",
              nullable: true,
              items: {
                type: "string",
              },
              example: null,
            },
          },
        },

        ApiSuccessEnvelope: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Request completed successfully.",
            },
            data: {
              nullable: true,
              type: "object",
            },
          },
        },

        MessageOnlyResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiSuccessEnvelope",
            },
            {
              type: "object",
              properties: {
                data: {
                  nullable: true,
                  type: "object",
                  example: null,
                },
              },
            },
          ],
        },

        // --------------------------------
        // 1. USER & AUTH SCHEMAS
        // --------------------------------

        BoardRefUser: {
          type: "object",
          description: "Minimal populated user object.",
          properties: {
            id: {
              type: "string",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            avatar: {
              type: "string",
              nullable: true,
              example: "https://example.com/avatar.jpg",
            },
          },
        },

        User: {
          type: "object",
          description: "Complete User profile model",
          properties: {
            id: {
              type: "string",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            authProvider: {
              type: "string",
              enum: ["local", "google"],
              example: "local",
            },
            isEmailVerified: {
              type: "boolean",
              example: true,
            },
            is2FAEnabled: {
              type: "boolean",
              example: false,
            },
            lastLogin: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password@123",
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password@123",
            },
            remember: {
              type: "boolean",
              example: true,
            },
          },
        },

        VerifyEmailRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            otp: {
              type: "string",
              example: "123456",
            },
          },
        },

        EmailRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },

        ResetPasswordRequest: {
          type: "object",
          required: ["email", "otp", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            otp: {
              type: "string",
              example: "123456",
            },
            password: {
              type: "string",
              format: "password",
              example: "NewPassword@123",
            },
          },
        },

        GoogleLoginRequest: {
          type: "object",
          required: ["idToken"],
          properties: {
            idToken: {
              type: "string",
              example: "google-id-token",
            },
          },
        },

        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs...",
            },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful.",
            },
            data: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIs...",
                },
                refreshToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIs...",
                },
              },
            },
          },
        },

        // --------------------------------
        // 2. WORKSPACE SCHEMAS
        // --------------------------------

        WorkspaceMember: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            role: {
              type: "object",
              properties: {
                id: { type: "string", example: "665f0a1e8b3f4a0012a3c9c0" },
                name: { type: "string", example: "Admin" },
              },
            },
            joinedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Workspace: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            name: {
              type: "string",
              example: "Engineering Core",
            },
            description: {
              type: "string",
              example: "Primary workspace for engineering team projects.",
            },
            color: {
              type: "string",
              example: "#6366F1",
            },
            icon: {
              type: "string",
              example: "code-bracket",
            },
            owner: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            members: {
              type: "array",
              items: {
                $ref: "#/components/schemas/WorkspaceMember",
              },
            },
            isPrivate: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateWorkspaceRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "Engineering Core",
            },
            description: {
              type: "string",
              example: "Primary workspace for engineering team projects.",
            },
            color: {
              type: "string",
              example: "#6366F1",
            },
            icon: {
              type: "string",
              example: "code-bracket",
            },
            isPrivate: {
              type: "boolean",
              example: false,
            },
          },
        },

        // --------------------------------
        // 3. PROJECT SCHEMAS
        // --------------------------------

        ProjectMember: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            role: {
              type: "string",
              example: "Developer",
            },
            joinedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            name: {
              type: "string",
              example: "TMS Backend API",
            },
            description: {
              type: "string",
              example: "MERN Stack Task Management System Backend",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            owner: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            members: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ProjectMember",
              },
            },
            tasks: {
              type: "array",
              items: {
                type: "string",
              },
            },
            color: {
              type: "string",
              example: "#6366F1",
            },
            status: {
              type: "string",
              enum: ["planning", "active", "on_hold", "completed", "cancelled", "archived"],
              example: "active",
            },
            progress: {
              type: "number",
              example: 45,
            },
            isArchived: {
              type: "boolean",
              example: false,
            },
            startDate: {
              type: "string",
              format: "date-time",
            },
            dueDate: {
              type: "string",
              format: "date-time",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateProjectRequest: {
          type: "object",
          required: ["name", "workspace"],
          properties: {
            name: {
              type: "string",
              example: "TMS Backend API",
            },
            description: {
              type: "string",
              example: "MERN Stack Task Management System Backend",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            color: {
              type: "string",
              example: "#6366F1",
            },
            startDate: {
              type: "string",
              format: "date-time",
            },
            dueDate: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // --------------------------------
        // 4. BOARD SCHEMAS
        // --------------------------------

        Board: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f3a1e8b3f4a0012a3cb10",
            },
            name: {
              type: "string",
              example: "Sprint Kanban Board",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            description: {
              type: "string",
              example: "Main development kanban board",
            },
            type: {
              type: "string",
              enum: ["kanban", "scrum"],
              example: "kanban",
            },
            columns: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["Backlog", "Todo", "In Progress", "Review", "Done"],
            },
            createdBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateBoardRequest: {
          type: "object",
          required: ["name", "workspace", "project"],
          properties: {
            name: {
              type: "string",
              example: "Sprint Kanban Board",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            description: {
              type: "string",
              example: "Main development board",
            },
            type: {
              type: "string",
              enum: ["kanban", "scrum"],
              example: "kanban",
            },
            columns: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["Backlog", "Todo", "In Progress", "Review", "Done"],
            },
          },
        },

        // --------------------------------
        // 5. SPRINT SCHEMAS
        // --------------------------------

        Sprint: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f4a1e8b3f4a0012a3cc20",
            },
            name: {
              type: "string",
              example: "Sprint 1 - Core Auth & Setup",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            board: {
              type: "string",
              nullable: true,
              example: "665f3a1e8b3f4a0012a3cb10",
            },
            goal: {
              type: "string",
              nullable: true,
              example: "665f6a1e8b3f4a0012a3cd80",
            },
            startDate: {
              type: "string",
              format: "date-time",
            },
            endDate: {
              type: "string",
              format: "date-time",
            },
            status: {
              type: "string",
              enum: ["planned", "active", "completed"],
              example: "active",
            },
            createdBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateSprintRequest: {
          type: "object",
          required: ["name", "workspace", "project", "startDate", "endDate"],
          properties: {
            name: {
              type: "string",
              example: "Sprint 1",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            board: {
              type: "string",
              example: "665f3a1e8b3f4a0012a3cb10",
            },
            startDate: {
              type: "string",
              format: "date-time",
            },
            endDate: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // --------------------------------
        // 6. TASK SCHEMAS
        // --------------------------------

        SubTask: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd11",
            },
            title: {
              type: "string",
              example: "Write unit tests for controller",
            },
            completed: {
              type: "boolean",
              example: false,
            },
          },
        },

        TaskComment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd12",
            },
            user: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            message: {
              type: "string",
              example: "PR has been opened for review.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        TaskAttachment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd13",
            },
            fileName: {
              type: "string",
              example: "architecture.png",
            },
            fileUrl: {
              type: "string",
              example: "https://res.cloudinary.com/demo/image/upload/architecture.png",
            },
            publicId: {
              type: "string",
              example: "tms/architecture_123",
            },
            fileType: {
              type: "string",
              example: "image/png",
            },
            fileSize: {
              type: "number",
              example: 1048576,
            },
            uploadedBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Task: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd10",
            },
            title: {
              type: "string",
              example: "Implement Activity Log module API",
            },
            description: {
              type: "string",
              example: "Create routes, controllers, services, and schemas for activity logs.",
            },
            board: {
              type: "string",
              example: "665f3a1e8b3f4a0012a3cb10",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            sprint: {
              type: "string",
              nullable: true,
              example: "665f4a1e8b3f4a0012a3cc20",
            },
            column: {
              type: "string",
              example: "In Progress",
            },
            assignee: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            watchers: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BoardRefUser",
              },
            },
            status: {
              type: "string",
              enum: ["todo", "in_progress", "in_review", "testing", "completed", "blocked"],
              example: "in_progress",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              example: "high",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["backend", "api", "feature"],
            },
            dueDate: {
              type: "string",
              format: "date-time",
            },
            completedAt: {
              type: "string",
              format: "date-time",
            },
            estimatedHours: {
              type: "number",
              example: 8,
            },
            actualHours: {
              type: "number",
              example: 4,
            },
            subtasks: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SubTask",
              },
            },
            comments: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaskComment",
              },
            },
            attachments: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TaskAttachment",
              },
            },
            isArchived: {
              type: "boolean",
              example: false,
            },
            createdBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateTaskRequest: {
          type: "object",
          required: ["title", "board", "project", "workspace", "column"],
          properties: {
            title: {
              type: "string",
              example: "Implement Activity Log module API",
            },
            description: {
              type: "string",
              example: "Create routes, controllers, services, and schemas for activity logs.",
            },
            board: {
              type: "string",
              example: "665f3a1e8b3f4a0012a3cb10",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            sprint: {
              type: "string",
              example: "665f4a1e8b3f4a0012a3cc20",
            },
            column: {
              type: "string",
              example: "Todo",
            },
            assignee: {
              type: "string",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              example: "medium",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["backend", "api"],
            },
            estimatedHours: {
              type: "number",
              example: 8,
            },
          },
        },

        // --------------------------------
        // 7. GOAL SCHEMAS
        // --------------------------------

        Goal: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f6a1e8b3f4a0012a3cd80",
            },
            title: {
              type: "string",
              example: "Launch v1.0.0 Product Release",
            },
            description: {
              type: "string",
              example: "Complete core TMS functionality and deploy to production.",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              nullable: true,
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            owner: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            status: {
              type: "string",
              enum: ["not_started", "in_progress", "completed", "at_risk", "cancelled"],
              example: "in_progress",
            },
            progress: {
              type: "number",
              example: 60,
            },
            targetDate: {
              type: "string",
              format: "date-time",
            },
            completedAt: {
              type: "string",
              format: "date-time",
            },
            linkedTasks: {
              type: "array",
              items: {
                type: "string",
              },
            },
            createdBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateGoalRequest: {
          type: "object",
          required: ["title", "workspace", "owner"],
          properties: {
            title: {
              type: "string",
              example: "Launch v1.0.0 Product Release",
            },
            description: {
              type: "string",
              example: "Complete core TMS functionality and deploy to production.",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            project: {
              type: "string",
              example: "665f2a1e8b3f4a0012a3ca50",
            },
            owner: {
              type: "string",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
            targetDate: {
              type: "string",
              format: "date-time",
            },
          },
        },

        // --------------------------------
        // 8. TEAMS SCHEMAS
        // --------------------------------

        TeamMember: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            joinedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Team: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f7a1e8b3f4a0012a3ce60",
            },
            name: {
              type: "string",
              example: "Platform Engineering",
            },
            description: {
              type: "string",
              example: "Owns core infrastructure and internal tooling.",
            },
            color: {
              type: "string",
              example: "#22C55E",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            lead: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            members: {
              type: "array",
              items: {
                $ref: "#/components/schemas/TeamMember",
              },
            },
            createdBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateTeamRequest: {
          type: "object",
          required: ["name", "lead"],
          properties: {
            name: {
              type: "string",
              example: "Platform Engineering",
            },
            description: {
              type: "string",
              example: "Owns core infrastructure and internal tooling.",
            },
            color: {
              type: "string",
              example: "#22C55E",
            },
            lead: {
              type: "string",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
          },
        },

        // --------------------------------
        // 9. ROLE SCHEMAS
        // --------------------------------

        Role: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f8a1e8b3f4a0012a3cf30",
            },
            name: {
              type: "string",
              example: "Project Manager",
            },
            workspace: {
              type: "string",
              nullable: true,
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["project:create", "project:update", "task:create", "task:assign"],
            },
            isSystem: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateRoleRequest: {
          type: "object",
          required: ["name", "permissions"],
          properties: {
            name: {
              type: "string",
              example: "Project Manager",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            permissions: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["project:create", "task:create"],
            },
          },
        },

        // --------------------------------
        // 10. INVITATION SCHEMAS
        // --------------------------------

        Invitation: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665f9a1e8b3f4a0012a3d040",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            role: {
              type: "string",
              example: "665f8a1e8b3f4a0012a3cf30",
            },
            invitedBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            type: {
              type: "string",
              enum: ["email", "link"],
              example: "email",
            },
            email: {
              type: "string",
              format: "email",
              example: "invitee@example.com",
            },
            token: {
              type: "string",
              example: "7f8b9c1d2e3f4a5b6c7d8e9f",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected", "revoked"],
              example: "pending",
            },
            acceptedBy: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateInvitationRequest: {
          type: "object",
          required: ["role", "type"],
          properties: {
            role: {
              type: "string",
              example: "665f8a1e8b3f4a0012a3cf30",
            },
            type: {
              type: "string",
              enum: ["email", "link"],
              example: "email",
            },
            email: {
              type: "string",
              format: "email",
              example: "invitee@example.com",
            },
          },
        },

        // --------------------------------
        // 11. ACTIVITY LOG SCHEMAS
        // --------------------------------

        ActivityLog: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "665fa11e8b3f4a0012a3d150",
            },
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            actor: {
              $ref: "#/components/schemas/BoardRefUser",
            },
            action: {
              type: "string",
              enum: [
                "created",
                "updated",
                "deleted",
                "status_changed",
                "assigned",
                "commented",
                "member_added",
                "member_removed",
              ],
              example: "status_changed",
            },
            entityType: {
              type: "string",
              enum: ["project", "task", "board", "sprint", "goal", "team", "workspace"],
              example: "task",
            },
            entityId: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd10",
            },
            entityName: {
              type: "string",
              example: "Implement Activity Log module API",
            },
            metadata: {
              type: "object",
              example: {
                oldStatus: "todo",
                newStatus: "in_progress",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateActivityLogRequest: {
          type: "object",
          required: ["workspace", "action", "entityType", "entityId"],
          properties: {
            workspace: {
              type: "string",
              example: "665f0a1e8b3f4a0012a3c9c1",
            },
            action: {
              type: "string",
              enum: [
                "created",
                "updated",
                "deleted",
                "status_changed",
                "assigned",
                "commented",
                "member_added",
                "member_removed",
              ],
              example: "status_changed",
            },
            entityType: {
              type: "string",
              enum: ["project", "task", "board", "sprint", "goal", "team", "workspace"],
              example: "task",
            },
            entityId: {
              type: "string",
              example: "665f5a1e8b3f4a0012a3cd10",
            },
            entityName: {
              type: "string",
              example: "Implement Activity Log module API",
            },
            metadata: {
              type: "object",
            },
          },
        },
      },
    },
  },

  apis: ["./src/modules/**/*.ts", "./src/server.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
