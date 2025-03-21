import { a } from "@aws-amplify/data-construct";

export const schema = a
  .schema({
    User: a.model({
      name: a.string().required(),
      role: a.string().required(), // "Physical Therapist" or "Virtual Health Assistant"
      groupId: a.id(),
      group: a.belongsTo("Group", "groupId"),
    }),

    Group: a.model({
      roleName: a.string().required(), // "Physical Therapist" or "Virtual Health Assistant"
      users: a.hasMany("User", "groupId"),
    }),

    Conversation: a.model({
      participants: a.array(a.id()).required(), // List of User IDs
      messages: a.hasMany("Message", "conversationId"),
      lastMessage: a.string(),
      lastUpdated: a.timestamp(),
    }),

    Message: a.model({
      conversationId: a.id(),
      conversation: a.belongsTo("Conversation", "conversationId"),
      senderId: a.id().required(),
      text: a.string().required(),
      timestamp: a.timestamp().required(),
    }),
  })
  .authorization((allow: { publicApiKey: () => void }) => allow.publicApiKey());
