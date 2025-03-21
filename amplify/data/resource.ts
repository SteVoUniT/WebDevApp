// amplify/data/resource.ts
import { defineData } from "@aws-amplify/backend-data";
import { a } from "@aws-amplify/data-schema";

const schema = a
  .schema({
    User: a.model({
      id: a.id(),
      name: a.string().required(),
      role: a.string().required(),
      groupId: a.string(), // Foreign key to Group
      group: a.belongsTo("Group"), // Corrected belongsTo - no fields option needed
    }),

    Group: a.model({
      id: a.id(),
      roleName: a.string().required(),
      users: a.hasMany("User"), // Corrected hasMany - no related field needed
    }),

    Conversation: a.model({
      id: a.id(),
      participants: a.string().array().required(),
      messages: a.hasMany("Message"), // Corrected hasMany
      lastMessage: a.string(),
      lastUpdated: a.datetime(),
    }),

    Message: a.model({
      id: a.id(),
      conversationId: a.string(), // Foreign key to Conversation
      conversation: a.belongsTo("Conversation"), // Corrected belongsTo
      senderId: a.string().required(),
      text: a.string().required(),
      timestamp: a.datetime().required(),
    }),
  })
  .authorization([a.allow.public()]); // Corrected authorization

export const data = defineData({ schema });
