import { defineData } from "@aws-amplify/backend-data";
import { a } from "@aws-amplify/data-schema";

const schema = a
  .schema({
    User: a.model({
      id: a.id(),
      name: a.string().required(),
      role: a.string().required(),
      groupId: a.string(),
      group: a.belongsTo("Group"),
    }),

    Group: a.model({
      id: a.id(),
      roleName: a.string().required(),
      users: a.hasMany("User"),
    }),

    Conversation: a.model({
      id: a.id(),
      participants: a.string().array().required(),
      messages: a.hasMany("Message"),
      lastMessage: a.string(),
      lastUpdated: a.datetime(),
    }),

    Message: a.model({
      id: a.id(),
      conversationId: a.string(),
      conversation: a.belongsTo("Conversation"),
      senderId: a.string().required(),
      text: a.string().required(),
      timestamp: a.datetime().required(),
    }),
  })
  .authorization([a.allow.public()]); // Use a.allow directly

export const data = defineData({ schema });
