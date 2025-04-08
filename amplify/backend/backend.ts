// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "@aws-amplify/backend-auth";
import { data } from "./data/resource";

export const backend = defineBackend({
  auth: auth(),
  data,
});
