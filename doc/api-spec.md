The OpenAPI v3 [spec for this service](https://raw.githubusercontent.com/revgum/user-api/refs/heads/main/packages/site/openapi.yaml) was used to generate this document.

This SST stack is deployed with a static site configured to host a basic SwaggerUI to view the API spec, the URL to the Cloudfront distribution hosting the website will be displayed on deploy (`SwaggerSiteUrl`).

---

# User API

**Version**: 1.0.0
**Description**: API for managing users
**Base URL**: [https://api.example.com/v1](https://api.example.com/v1)

## Paths

### Create a New User

**POST** `/users`

- **Summary**: Create a new user
- **Request Body**:
  - **Required**: Yes
  - **Content**:
    - `application/json`
      - Schema: [UserCreateInput](#UserCreateInput)
- **Responses**:
  - **201**: [UserResponse](#UserResponse)
  - **400**: [ServiceErrorResponse](#ServiceErrorResponse)
  - **403**: [NotAuthorizedErrorResponse](#NotAuthorizedErrorResponse)
  - **404**: [NotFoundErrorResponse](#NotFoundErrorResponse)
  - **422**: User create failed, unprocessable entity
    - **Content**:
      - `application/json`
        - Schema: [Meta](#Meta), [ServiceError](#ServiceError)
  - **500**: [InternalErrorResponse](#InternalErrorResponse)
- **Security**: Bearer API token required

---

### Retrieve a User by ID

**GET** `/users/{userId}`

- **Tags**: users
- **Summary**: Retrieve a user by ID
- **Parameters**:
  - **userId** (path): The ID of the user (required)
- **Responses**:
  - **200**: [UserResponse](#UserResponse)
  - **400**: [ServiceErrorResponse](#ServiceErrorResponse)
  - **403**: [NotAuthorizedErrorResponse](#NotAuthorizedErrorResponse)
  - **404**: [NotFoundErrorResponse](#NotFoundErrorResponse)
  - **500**: [InternalErrorResponse](#InternalErrorResponse)
- **Security**: Bearer API token required

---

### Update an Existing User

**PATCH** `/users/{userId}`

- **Summary**: Update an existing user
- **Request Body**:
  - **Required**: Yes
  - **Content**:
    - `application/json`
      - Schema: [UserUpdateInput](#UserUpdateInput)
- **Responses**:
  - **200**: [UserResponse](#UserResponse)
  - **400**: [ServiceErrorResponse](#ServiceErrorResponse)
  - **403**: [NotAuthorizedErrorResponse](#NotAuthorizedErrorResponse)
  - **404**: [NotFoundErrorResponse](#NotFoundErrorResponse)
  - **500**: [InternalErrorResponse](#InternalErrorResponse)
- **Security**: Bearer API token required

**PUT** `/users/{userId}`

- **Summary**: Update an existing user
- **Request Body**:
  - **Required**: Yes
  - **Content**:
    - `application/json`
      - Schema: [UserUpdateInput](#UserUpdateInput)
- **Responses**:
  - **200**: [UserResponse](#UserResponse)
  - **400**: [ServiceErrorResponse](#ServiceErrorResponse)
  - **403**: [NotAuthorizedErrorResponse](#NotAuthorizedErrorResponse)
  - **404**: [NotFoundErrorResponse](#NotFoundErrorResponse)
  - **500**: [InternalErrorResponse](#InternalErrorResponse)
- **Security**: Bearer API token required

---

### Delete a User

**DELETE** `/users/{userId}`

- **Summary**: Delete a user
- **Responses**:
  - **204**: [MessageResponse](#MessageResponse)
  - **400**: [ServiceErrorResponse](#ServiceErrorResponse)
  - **403**: [NotAuthorizedErrorResponse](#NotAuthorizedErrorResponse)
  - **500**: [InternalErrorResponse](#InternalErrorResponse)
- **Security**: Bearer API token required

## Responses

### UserResponse

- **Description**: A user
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [User](#User)

### MessageResponse

- **Description**: A message
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [Message](#Message)

### NotAuthorizedErrorResponse

- **Description**: API authorization failed, forbidden access
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [ServiceError](#ServiceError)

### NotFoundErrorResponse

- **Description**: Resource not found
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [ServiceError](#ServiceError)

### ServiceErrorResponse

- **Description**: API error
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [ServiceError](#ServiceError)

### InternalErrorResponse

- **Description**: Internal server error
- **Content**:
  - `application/json`
    - Schema: [Meta](#Meta), [ServiceError](#ServiceError)

## Schemas

### Meta

- **Properties**:
  - `meta`: object
    - **Properties**:
      - `version`: string (required, default: `1.0.0`)
      - `requestId`: string (required)

### User

- **Description**: A User may have up to 3 unique email addresses. Email addresses can be added but not removed from a User.
- **Properties**:
  - `user`: object
    - **Properties**:
      - `userId`: string (required, allows base64 urlencoded values)
        - Example: `my-user-id`
      - `name`: string (required)
      - `dob`: string (optional, allows YYYY-MM-DD format)
        - Example: `1914-02-12`
      - `emails`: array of strings (required, maxItems: 3, uniqueItems: true, allows email format)
        - Example: `me@example.com`

### UserCreateInput

- **Properties**:
  - `userId`: string (required, allows base64 urlencoded values)
    - Example: `my-user-id`
  - `name`: string (required)
  - `dob`: string (optional, allows YYYY-MM-DD format)
    - Example: `1914-02-12`
  - `emails`: array of strings (required, maxItems: 3, uniqueItems: true, allows email format)
    - Example: `me@example.com`

### UserUpdateInput

- **Properties**:
  - `name`: string (optional)
  - `dob`: string (optional, allows YYYY-MM-DD format)
    - Example: `1914-02-12`
  - `emails`: array of strings (optional, maxItems: 3, uniqueItems: true, allows email format)
    - Example: `me@example.com`

### Message

- **Properties**:
  - `message`: string (required)

### ServiceError

- **Properties**:
  - `error`: object
    - **Properties**:
      - `detail`: string (required)
      - `statusCode`: string (required)
      - `title`: string (required)
      - `causedBy`: array of objects (optional)
        - **Properties**
          - `code`: string
          - `title`: string
          - `detail`: string
      - `errorCode`: object (oneOf, required)
        - `api.authentication.failed`: The API key supplied was invalid or incorrect.
        - `api.authorization.missing`: An API key was not provided.
        - `api.request.invalid`: The API request content could not be parsed.
        - `api.request.missing`: The API request did not include content.
        - `api.validation.failed`: The API request content did not match the allowed spec.
        - `api.validation.invalid`: The API request content failed to parse.
        - `entity.action.failed`: The entity failed during persistence.
        - `entity.condition-check.failed`: The entity failed to persist during a condition check.
        - `entity.invalid`: The entity failed during schema validation.
        - `entity.not-found`: The entity requested was not found.
        - `entity.parsing.failed`: The entity included an invalid property.
        - `entity.validation.failed`: The entity included a property that failed validation.

## Security Schemes

### Bearer

- **Type**: apiKey
- **Name**: Authorization
- **In**: Request Header

```
  Authorization: Bearer <API_KEY>
```
