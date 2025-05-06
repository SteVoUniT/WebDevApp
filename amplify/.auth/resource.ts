import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  }/*,
  userAttributes: {
  // Maps to Cognito standard attribute 'name'
  familyName: {
  mutable: true,
  required: true,
},

},*/
});

/*
 * Ask for:
 * - reshow this file
 * - re-explain base 64 encoded string bit thingy
 * - images are best referenced and then grabbed, not like HI iirc
 */


/*
 * - S3 stores BLOBs/BIG FILES
 */



/// 3 tier architechture is normal:

// 2 tier removes middle thingy AKA server
// use functions via AWS for db (now it becomes 3 tier lol)


/*
 *  import { defineAuth } from '@aws-amplify/backend';
 *
 * /**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * export const auth = defineAuth({
 *  loginWith: {
 *    email: true,
 *  },
 *  userAttributes: {
 *    // Maps to Cognito standard attribute 'family_name'
 *    familyName: {
 *      mutable: true,
 *      required: true,
 *    },
 *    // Add email as a required attribute that matches the User model
 *    email: {
 *      required: true,
 *      mutable: false,
 *    },
 *    // You can add more user attributes as needed
 *  },
 * });
 */


 Message @Stathi :0
