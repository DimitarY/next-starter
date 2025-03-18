# Next Starter

Example Next.js project with shadcn/ui using better-auth, Drizzle ORM, and TanStack Query.

## Environment Variables

To run this project, you will need to configure the following environment variables.

### .env

| Environment Variable Name          | Description                                                              |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`             | The base URL for the application, e.g., `https://localhost:3000`.        |
| `DATABASE_URL`                     | The connection string for the database.                                  |
| `RESEND_API_KEY`                   | API key for the Resend service.                                          |
| `RESEND_DOMAIN`                    | Domain for the Resend email service.                                     |
| `BETTER_AUTH_URL`                  | The base URL for BetterAuth, e.g., `https://localhost:3000`.             |
| `BETTER_AUTH_SECRET`               | A random value used by the library for encryption and generating hashes. |
| `BETTER_AUTH_GOOGLE_CLIENT_ID`     | Google OAuth client ID.                                                  |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret.                                              |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | GitHub OAuth client ID.                                                  |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret.                                              |
| `UPLOADTHING_TOKEN`                | API token for the UploadThing service.                                   |

### .env.development

| Environment Variable Name | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`    | Override the `.env` value for development.                    |
| `BETTER_AUTH_URL`         | Override the `.env` value for development.                    |
| `LOCAL_DNS_RECORD`        | If using a local DNS record for development, specify it here. |

### .env.production

| Environment Variable Name  | Description                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`     | Override the `.env` value for production.                                                                                                                    |
| `BETTER_AUTH_URL`          | Override the `.env` value for production.                                                                                                                    |
| `UPLOADTHING_CALLBACK_URL` | The callback URL for UploadThing in production. See [documentation](https://docs.uploadthing.com/faq#my-callback-runs-in-development-but-not-in-production). |

### .env.container

| Environment Variable Name          | Description                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`             | The base URL for production build.                                                                                                                           |
| `DATABASE_URL`                     | The connection string for the database.                                                                                                                      |
| `RESEND_API_KEY`                   | API key for the Resend service.                                                                                                                              |
| `RESEND_DOMAIN`                    | Domain for the Resend email service.                                                                                                                         |
| `BETTER_AUTH_URL`                  | The base URL for BetterAuth, same as `NEXT_PUBLIC_BASE_URL`.                                                                                                 |
| `BETTER_AUTH_SECRET`               | A random value used by the library for encryption and generating hashes.                                                                                     |
| `BETTER_AUTH_GOOGLE_CLIENT_ID`     | Google OAuth client ID.                                                                                                                                      |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret.                                                                                                                                  |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | GitHub OAuth client ID.                                                                                                                                      |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret.                                                                                                                                  |
| `UPLOADTHING_TOKEN`                | API token for the UploadThing service.                                                                                                                       |
| `UPLOADTHING_CALLBACK_URL`         | The callback URL for UploadThing in production. See [documentation](https://docs.uploadthing.com/faq#my-callback-runs-in-development-but-not-in-production). |

### Additional environment variables

| Environment Variable Name               | Description                                            |
| --------------------------------------- | ------------------------------------------------------ |
| `MAGIC_LINK_EXPIRES_IN_SECONDS`         | Used to change the expires time for Magic Link         |
| `EMAIL_VERIFICATION_EXPIRES_IN_SECONDS` | Used to change the expires time for Email Verification |

## Run Locally

Clone the project

```bash
  git clone https://github.com/DimitarY/next-starter
```

---

Install dependencies

```bash
  pnpm install
```

---

Start development server

```bash
  pnpm dev
```

---

Build container

```bash
  podman build \
  --tag ghcr.io/dimitary/next-starter \
  --build-arg NEXT_PUBLIC_BASE_URL=$(grep NEXT_PUBLIC_BASE_URL .env.container | cut -d '=' -f2) \
  --platform linux/amd64 \
  .
```

---

Start container

```bash
  podman run -d \
  -p 3000:3000 \
  --restart unless-stopped \
  --name next-starter-container \
  --env-file .env.container \
  ghcr.io/dimitary/next-starter
```

> **Note:** If your database connection uses SSL, you must mount the certificate volume.
>
> For example: `-v $HOME/next-starter/certificates:/app/certificates:ro`<br>
> For SELinux, use: `-v $HOME/next-starter/certificates:/app/certificates:ro,Z`

---

Remove **Dangling** images

```bash
  podman images --filter "dangling=true" --quiet | xargs podman rmi
```
