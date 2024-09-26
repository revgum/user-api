The OpenAPI v3 [spec for this service](https://raw.githubusercontent.com/revgum/user-api/refs/heads/main/packages/functions/src/v1/openapi.yaml) was used to generate this markdown documentation. You can paste the contents of the spec in a Swagger editor for a better view of the documentation at [Swagger Editor](https://editor-next.swagger.io/).

---

# User API Documentation

**Version**:1.0.0

**Description**: API for managing users.

## Base URL

`https://api.example.com/v1`

### Authentication

#### API Key

A valid API Key must be provided in the `Authorization` request header, see the following header example:

`Authorization: Bearer API_KEY`

## Paths

### `/users`

#### **POST** - Create a New User

- **Summary**: Create a new user.
- **Request Body**:

  - **Content-Type**: `application/json`
  - **Schema**: [UserCreateInput](#usercreateinput)

- **Responses**:
  - **201**: User created successfully
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [UserResponse](#userresponse)
  - **Errors**
    - **400**: API error response
    - **403**: API authorization failed, forbidden access
    - **422**: User create failed, unprocessable entity
    - **500**: Internal server error
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [ServiceErrorResponse](#serviceerrorresponse)
- **Security**: Bearer token required

### `/users/{userId}`

#### Parameters

- **userId** (string, required): The ID of the user.

#### **GET** - Retrieve a User by ID

- **Summary**: Retrieve user details by ID.

- **Responses**:
  - **200**: User details
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [UserResponse](#userresponse)
  - **Errors**
    - **400**: API error response
    - **403**: API authorization failed, forbidden access
    - **404**: User not found
    - **500**: Internal server error
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [ServiceErrorResponse](#serviceerrorresponse)
- **Security**: Bearer token required

#### **PATCH** - Update an Existing User

- **Summary**: Update an existing user.
- **Request Body**:

  - **Content-Type**: `application/json`
  - **Schema**: [UserUpdateInput](#userupdateinput)

- **Responses**:
  - **200**: User updated successfully
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [UserResponse](#userresponse)
  - **Errors**
    - **400**: API error response
    - **403**: API authorization failed, forbidden access
    - **404**: User not found
    - **500**: Internal server error
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [ServiceErrorResponse](#serviceerrorresponse)
- **Security**: Bearer token required

#### **PUT** - Update an Existing User

- **Summary**: Update an existing user.
- **Request Body**:

  - **Content-Type**: `application/json`
  - **Schema**: [UserUpdateInput](#userupdateinput)

- **Responses**:
  - **200**: User updated successfully
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [UserResponse](#userresponse)
  - **Errors**
    - **400**: API error response
    - **403**: API authorization failed, forbidden access
    - **404**: User not found
    - **500**: Internal server error
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [ServiceErrorResponse](#serviceerrorresponse)
  - **Security**: Bearer token required

#### **DELETE** - Delete a User

- **Summary**: Delete a user.

- **Responses**:
  - **204**: User deleted
    - **Content**:
      - `application/json`:
        - Schema: [DeleteResponse](#deleteresponse)
  - **Errors**
    - **400**: API error response
    - **403**: API authorization failed, forbidden access
    - **500**: Internal server error
    - **Content**:
      - `application/json`:
        - Schema: [MetaResponse](#metaresponse) + [ServiceErrorResponse](#serviceerrorresponse)
- **Security**: Bearer token required

## Components

### Schemas

#### MetaResponse

```json
{
  "meta": {
    "version": "string",
    "requestId": "string"
  }
}
```

#### UserResponse

```json
{
  "payload": {
    "user": {
      "userId": "string",
      "name": "string",
      "dob": "string",
      "emails": ["string"]
    }
  }
}
```

#### UserCreateInput

```json
{
  "userId": "string",
  "name": "string",
  "dob": "string",
  "emails": ["string"]
}
```

#### UserUpdateInput

```json
{
  "name": "string",
  "dob": "string",
  "emails": ["string"]
}
```

#### DeleteResponse

```json
{
  "message": "string"
}
```

#### ServiceErrorResponse

```json
{
  "error": {
    "detail": "string",
    "errorCode": "string",
    "statusCode": "string",
    "title": "string",
    "causedBy": [
      {
        "title": "string",
        "detail": "string",
        "code": "string"
      }
    ]
  }
}
```
