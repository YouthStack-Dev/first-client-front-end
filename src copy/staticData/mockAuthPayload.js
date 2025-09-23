import { admi2Modules, admin1Modules, clientadmin1Modules, clientadmin2Modules, superAdminModules, vendo1Module, vendor2Module } from "./ModulePermissions";

export const mockAuthPayload = {
  users: [
    // 🔹 Super Admin
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6InN1cGVyQGVtYWlsLmNvbSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImV4cCI6MTkwMDAwMDAwMH0.dummy-signature",
       user: {
        id: "u1",
        username: "superadmin",
        email: "super@email.com",
        role: "SUPER_ADMIN",
        type: "superadmin",
      },
      allowedModules: superAdminModules

    },

    // 🔹 Client Admin #1
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNsaWVudGFkbWluMSIsImVtYWlsIjoiY2xpZW50MUBlbWFpbC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiY2xpZW50SWQiOiJjbGllbnQxIiwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signature",
      user: {
        id: "u2",
        username: "clientadmin1",
        email: "client1@email.com",
        role: "CLIENT",
        type: "client",
        clientId: "client1",
      },
      allowedModules: clientadmin1Modules
    },

    // 🔹 Client Admin #2
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNsaWVudGFkbWluMiIsImVtYWlsIjoiY2xpZW50MkBlbWFpbC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiY2xpZW50SWQiOiJjbGllbnQyIiwiZXhwIjoxOTAwMDAwMDAwfQ.dummy-signature",
      user: {
        id: "u3",
        username: "clientadmin2",
        email: "client2@email.com",
        role: "CLIENT",
        type: "client",
        clientId: "client2",
      },
      allowedModules:clientadmin2Modules
    },

    // 🔹 Company Admin #1
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMSIsImVtYWlsIjoiYWRtaW4xQGNvbXBhbnkuY29tIiwicm9sZSI6IkFETUlOIiwiY2xpZW50SWQiOiJjbGllbnQxIiwiY29tcGFueUlkIjoiY29tcGFueTEiLCJleHAiOjE5MDAwMDAwMDB9.dummy-signature",
      user: {
        id: "u4",
        username: "admin1",
        email: "admin1@company.com",
        role: "ADMIN",
        type: "admin",
        clientId: "client1",
        companyId: "company1",
      },
      allowedModules: admin1Modules
    },

    // 🔹 Company Admin #2
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMiIsImVtYWlsIjoiYWRtaW4yQGNvbXBhbnkuY29tIiwicm9sZSI6IkFETUlOIiwiY2xpZW50SWQiOiJjbGllbnQxIiwiY29tcGFueUlkIjoiY29tcGFueTIiLCJleHAiOjE5MDAwMDAwMDB9.dummy-signature",
      user: {
        id: "u5",
        username: "admin2",
        email: "admin2@company.com",
        role: "ADMIN",
        type: "admin",
        clientId: "client1",
        companyId: "company2",
      },
      allowedModules: admi2Modules
    },

    // 🔹 Vendor User #1
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZlbmRvcjEiLCJlbWFpbCI6InZlbmRvcjFAZW1haWwuY29tIiwicm9sZSI6IlZFTkRPUiIsImV4cCI6MTkwMDAwMDAwMH0.dummy-signature",
      user: {
        id: "u6",
        username: "vendor1",
        email: "vendor1@email.com",
        role: "VENDOR",
        type: "vendor",
      },
      allowedModules: vendo1Module
    },

    // 🔹 Vendor User #2
    {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZlbmRvcjIiLCJlbWFpbCI6InZlbmRvcjJAZW1haWwuY29tIiwicm9sZSI6IlZFTkRPUiIsImV4cCI6MTkwMDAwMDAwMH0.dummy-signature",
      user: {
        id: "u7",
        username: "vendor2",
        email: "vendor2@email.com",
        role: "VENDOR",
        type: "vendor",
      },
      allowedModules: vendor2Module
    },
  ],
};
