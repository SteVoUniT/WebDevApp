import { defineData } from "@aws-amplify/backend-data";
import { a, type ClientSchema } from "@aws-amplify/data-schema";

const schema = a
  .schema({
    User: a.model({
      id: a.id(), // Always include an ID field
      name: a.string().required(),
      role: a.string().required(), // "Physical Therapist" or "Virtual Health Assistant"
      groupId: a.string(), // Changed to string, consistent with belongsTo
      group: a.belongsTo("Group", { fields: ["groupId"] }), // Corrected belongsTo
    }),

    Group: a.model({
      id: a.id(), // Always include an ID field
      roleName: a.string().required(), // "Physical Therapist" or "Virtual Health Assistant"
      users: a.hasMany("User"), // Simplified hasMany - the related field is inferred
    }),

    Conversation: a.model({
      id: a.id(), // Always include an ID
      participants: a.string().array().required(), // Correct array of strings for IDs
      messages: a.hasMany("Message"), // Simplified hasMany
      lastMessage: a.string(),
      lastUpdated: a.datetime(), // Use datetime for timestamps
    }),

    Message: a.model({
      id: a.id(), // Always include an ID
      conversationId: a.string(), // Changed to string, consistent with belongsTo
      conversation: a.belongsTo("Conversation", { fields: ["conversationId"] }), // Corrected belongsTo
      senderId: a.string().required(), // Changed to string for User ID
      text: a.string().required(),
      timestamp: a.datetime().required(), // Use datetime for timestamps
    }),
  })
  .authorization([a.allow.public()]); // Corrected authorization - using public for simplicity, change as needed

export const data = defineData({ schema });
