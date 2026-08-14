import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Gravity Task Management System API",
      version: "1.0.0",
      description:
        "REST API documentation for the Gravity Task Management System.",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "Authentication and account management APIs",
      },
      {
        name: "Goals",
        description:
          "Workspace goal management APIs (create, track, and link goals to tasks)",
      },
      {
        name: "Boards",
        description:
          "Board management APIs (view, update, delete boards within a project)",
      },
      {
        name: "Projects",
        description:
          "Project management APIs (members, boards, sprints, and tasks within a project)",
      },
      {
        name: "Roles",
        description:
          "Workspace role management APIs (list, update, and delete custom roles)",
      },
      {
        name: "Teams",
        description:
          "Team management APIs (create, update, delete teams and manage membership within a workspace)",
      },
      {
        name: "Users",
        description: "User profile and account management APIs",
      },
      {
        name: "Workspaces",
        description:
          "Workspace management APIs (create, update, delete workspaces and manage member roles)",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },

      schemas: {
        ApiErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid email or password." },
            errors: {
              type: "array",
              items: { type: "string" },
              nullable: true,
              example: null,
            },
          },
        },

        ApiSuccessEnvelope: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Request successful." },
            data: { type: "object", nullable: true },
          },
        },

        MessageOnlyResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiSuccessEnvelope" },
            {
              type: "object",
              properties: {
                data: { type: "object", nullable: true, example: null },
              },
            },
          ],
        },

        BoardRefUser: {
          type: "object",
          description: "Minimal populated user reference.",
          properties: {
            id: { type: "string", example: "665f1c2e8b3f4a0012a3c9d1" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            avatar: {
              type: "string",
              example: "https://lh3.googleusercontent.com/a/abc123",
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

        TeamMember: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/BoardRefUser" },
            joinedAt: { type: "string", format: "date-time" },
          },
        },

        Team: {
          type: "object",
          properties: {
            id: { type: "string", example: "665f7a1e8b3f4a0012a3ce60" },
            name: { type: "string", example: "Platform Engineering" },
            description: {
              type: "string",
              example: "Owns core infra and internal tooling.",
            },
            color: { type: "string", example: "#22C55E" },
            workspace: { type: "string", example: "665f0a1e8b3f4a0012a3c9c1" },
            lead: { $ref: "#/components/schemas/BoardRefUser" },
            members: {
              type: "array",
              items: { $ref: "#/components/schemas/TeamMember" },
            },
            createdBy: { $ref: "#/components/schemas/BoardRefUser" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        CreateTeamRequest: {
          type: "object",
          required: ["name", "lead"],
          properties: {
            name: { type: "string", example: "Platform Engineering" },
            description: {
              type: "string",
              example: "Owns core infra and internal tooling.",
            },
            color: { type: "string", example: "#22C55E" },
            lead: {
              type: "string",
              description: "Must already be a member of the workspace.",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
          },
        },

        UpdateTeamRequest: {
          type: "object",
          description: "All fields optional; only provided fields are updated.",
          properties: {
            name: { type: "string", example: "Platform & Infra" },
            description: {
              type: "string",
              example: "Updated team description.",
            },
            color: { type: "string", example: "#3B82F6" },
          },
        },

        AddTeamMemberRequest: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: {
              type: "string",
              description: "Must already be a member of the team's workspace.",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
          },
        },

        ChangeTeamLeadRequest: {
          type: "object",
          required: ["leadId"],
          properties: {
            leadId: {
              type: "string",
              description:
                "Must be a member of the workspace. Added to the team if not already a member.",
              example: "665f1c2e8b3f4a0012a3c9d1",
            },
          },
        },

        TeamResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiSuccessEnvelope" },
            {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Team updated successfully.",
                },
                data: { $ref: "#/components/schemas/Team" },
              },
            },
          ],
        },

        TeamsListResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiSuccessEnvelope" },
            {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Teams fetched successfully.",
                },
                data: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Team" },
                },
              },
            },
          ],
        },
      },
    },
  },

  apis: ["./src/modules/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
