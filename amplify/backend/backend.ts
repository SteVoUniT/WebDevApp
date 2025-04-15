import { defineBackend } from "@aws-amplify/backend";
import { defineAuth } from "@aws-amplify/backend-auth";
import { defineData } from "./data/resource";

export const backend = defineBackend({
  auth: defineAuth(),
  data: defineData(),
});
