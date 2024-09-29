## Testing

### Unit and integration tests

The application includes tests using `vitest` and AWS mock clients to make testing locally possible. The test suite is ran with the following command:

```bash
npm run test
```

### Local API tests with `curl`

1. **Run the application in `dev` mode**

   Start the application and copy the `ApiEndpoint` url provided in the UserStack deployed message.

   ```bash
   npm run dev

   ...

   ✔  Complete:
   Api: https://rzwdu6kbqk.execute-api.us-west-2.amazonaws.com
   ---
   Region: us-west-2
   SwaggerUI: https://url-unavailable-in-dev.mode

   ```

2. **Use `curl` to test endpoints**

Using `curl` with the `ApiEndpoint` URL and the API key you set the "Getting Started" section, make API requests from the command line.

```bash
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" --data '{"userId": "my-user-id","emails":["email@example.com"],"name":"Example User","dob":"1902-01-23"}' <API-ENDPOINT-URL-HERE>/v1/users
```

#### Example `curl` commands

```bash
# Create a user, a second API call with the same userId will fail because the user exists
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" --data '{"userId": "my-user-id","emails":["email@example.com"],"name":"Example User","dob":"1902-01-23"}' <API-ENDPOINT-URL-HERE>/v1/users

# Update the full user record with a PUT; emails provided are only additive, excluding "dob" will remove the field
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" -X PUT --data '{"emails":["another_email@example.com"],"name":"Updated Name"}' <API-ENDPOINT-URL-HERE>/v1/users/my-user-id

# Update part of the user record with a PATCH; emails provided are only additive
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" -X PUT --data '{"dob":"1912-02-04"}' <API-ENDPOINT-URL-HERE>/v1/users/my-user-id

# Get the user
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" <API-ENDPOINT-URL-HERE>/v1/users/my-user-id

# Get an invalid user
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" <API-ENDPOINT-URL-HERE>/v1/users/thisuserISNOTfound

# Failure examples with invalid data fields
curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" --data '{"userId": "invalid user id","emails":["email@example.com"],"name":"Example User","dob":"1902-01-23"}' <API-ENDPOINT-URL-HERE>/v1/users

curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" --data '{"userId": "test-user-id","emails":["invalid email address"],"name":"Example User","dob":"1902-01-23"}' <API-ENDPOINT-URL-HERE>/v1/users

curl --header "Content-Type:application/json" --header "Authorization: Bearer <API-KEY-HERE>" --data '{"userId": "test-user-id","emails":["email@example.com"],"name":"Example User","dob":"20001225"}' <API-ENDPOINT-URL-HERE>/v1/users
```
