import { defineData } from "@aws-amplify/backend-data";
import { a } from "@aws-amplify/data-schema";

const schema = a
  .schema({
    User: a.model({
      userId: a.id(),
      name: a.string(),
      role: a.string(),
      groupId: a.string(),
      group: a.belongsTo("Group", "groupId"),
    }),

    Group: a.model({
      groupId: a.id(),
      roleName: a.string(),
      users: a.hasMany("User", "groupId"),
    }),

    Conversation: a.model({
      conversationId: a.id(),
      participants: a.string().array(),
      messages: a.hasMany("Message", "messageId"),
      lastMessage: a.string(),
      lastUpdated: a.datetime(),
    }),

    Message: a.model({
      messageId: a.id(),
      conversationId: a.string(),
      conversation: a.belongsTo("Conversation", "conversationId"),
      senderId: a.string(),
      text: a.string(),
      timestamp: a.datetime(),
    }),
  })
  .authorization([a.allow.public()]); // Global authorization rule

export const data = defineData({ schema });
