export const v1Routes = {
  "GET /v1/users/{id}": "packages/functions/src/v1/user/get.main",
  "POST /v1/users": "packages/functions/src/v1/user/create.main",
  "DELETE /v1/users/{id}": "packages/functions/src/v1/user/delete.main",
  "PUT /v1/users/{id}": "packages/functions/src/v1/user/update.main",
  "PATCH /v1/users/{id}": "packages/functions/src/v1/user/update.main",
};
