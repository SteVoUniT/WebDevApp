import { defineData } from "@aws-amplify/backend-data";
import { a } from "@aws-amplify/data-schema";

const schema = a
  .schema({
    User: a
      .model({
        userId: a.id(),
        name: a.string(),
        role: a.string(),
        groupId: a.string(),
        group: a.belongsTo("Group", "groupId"),
      })
      .authorization(allow => [allow.owner()])
      ,
      
    Group: a
      .model({
        groupId: a.id(),
        roleName: a.string(),
        users: a.hasMany("User", "groupId"),
      })
      .authorization(allow => [allow.owner(), allow.authenticated().to(['read', 'update'])]), // Example adjusted auth
        // Only authenticated users can access groups
        // You might want to add more specific rules based on roles or group membership
      

    Conversation: a
      .model({
        conversationId: a.id(),
        participants: a.string().array(),
        messages: a.hasMany("Message", "conversationId"),
        lastMessage: a.string(),
        lastUpdated: a.datetime(),
      })
      .authorization(allow => [
        allow.owner().to(['create','delete']), // Let creator manage existence
        // WARNING: This rule allows ANY authenticated user to read/update ANY conversation.
        // This is necessary for easy fetching by participants initially.
        // SECURE THIS LATER using dynamic groups based on 'participants' or custom logic.
        allow.authenticated().to(['read', 'update'])
      ])
      ,

    Message: a
      .model({
        messageId: a.id(),
        conversationId: a.id(),
        conversation: a.belongsTo("Conversation", "conversationId"),
        senderId: a.string(),
        text: a.string(),
        timestamp: a.datetime(),
      })
      .authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),
    // Remove the public API key if you are implementing more specific auth
    // auth.publicApiKey();
  });

export const data = defineData({
  schema,
  authorizationModes: {
    // This tells the data client in your app (generateClient())
    // to sign API requests with the user authentication token.
    defaultAuthorizationMode: 'userPool',
  },
});