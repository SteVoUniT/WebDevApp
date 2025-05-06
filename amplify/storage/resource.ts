// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend-storage';

export const storage = defineStorage({
  name: 'messageBucket', // Choose a unique name
  access: (allow) => ({
    // Define access control for paths within the bucket
    'media/profile-pictures/{entity_id}/*': [ // Example path
      allow.guest.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    'media/message-attachments/*': [ // Example for message attachments
       allow.authenticated.to(['read', 'write', 'delete']) // Allow any logged in user
    ]
  })
});