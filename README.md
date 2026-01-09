# Clerk + Java Spring Boot + React Demo

A demo application showing how to integrate Clerk authentication with a Java Spring Boot backend and a React frontend.

## Project Structure

```
├── backend/                 # Spring Boot application
│   ├── src/main/java/com/example/clerkdemo/
│   │   ├── ClerkDemoApplication.java
│   │   ├── config/CorsConfig.java
│   │   ├── controller/
│   │   │   ├── PublicController.java
│   │   │   └── ProtectedController.java
│   │   └── filter/ClerkAuthFilter.java
│   ├── .env.example
│   └── pom.xml
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── api/client.ts    # Axios with auth interceptor
│   │   ├── components/Header.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SignInPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── .env.example
└── clerk-sdk-java/          # (Optional) Local SDK build
```

## Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- A Clerk account ([sign up here](https://clerk.com))

### Installing Java & Maven (macOS)

```bash
brew install openjdk@17 maven
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Quick Start

### 1. Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**

### 2. Configure & Run Backend

```bash
cd backend

# Create .env file with your Clerk secret key
cp .env.example .env
# Edit .env and add: CLERK_SECRET_KEY=sk_test_your_secret_key

# Run the backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`

### 3. Configure & Run Frontend

```bash
cd frontend

# Create .env file
cp .env.example .env
# Edit .env and add your Clerk publishable key

# Install dependencies and run
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`

## Environment Variables

### Backend (`backend/.env`)

```
CLERK_SECRET_KEY=sk_test_your_secret_key
```

### Frontend (`frontend/.env`)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_CLERK_SIGN_IN_URL="/sign-in"
VITE_CLERK_SIGN_UP_URL="/sign-up"
VITE_API_URL=http://localhost:8080
```

## API Endpoints

| Endpoint | Auth Required | Description |
|----------|---------------|-------------|
| `GET /api/health` | No | Health check |
| `GET /api/public/info` | No | Public information |
| `GET /api/protected/user` | Yes | Get authenticated user info |
| `GET /api/protected/data` | Yes | Get protected data |
| `POST /api/protected/generate-long-lived-token` | Yes | Generate a session token with 1-month expiration |

## How It Works

### Backend Authentication Flow

1. `ClerkAuthFilter` intercepts requests to `/api/protected/*`
2. Extracts JWT from the `Authorization: Bearer` header
3. Validates token using Clerk Java SDK's `AuthenticateRequest.authenticateRequest()`
4. Extracts user ID and session ID from claims
5. Makes these available to controllers via request attributes

### Frontend Authentication Flow

1. `ClerkProvider` wraps the app with authentication context
2. Axios interceptor calls `window.Clerk.session.getToken()` for each request
3. Token is automatically added to `Authorization` header
4. Protected routes use `SignedIn`/`SignedOut` for conditional rendering

### Long-Lived Session Tokens

The Dashboard includes a feature to generate session tokens with extended expiration (30 days). This uses the Clerk Backend API's `sessions.createToken()` method with a custom `expiresInSeconds` parameter.

```bash
# Example: Test the generated token with curl
curl -X GET "http://localhost:8080/api/protected/user" \
  -H "Authorization: Bearer <your-generated-jwt>"
```

The Dashboard UI provides a copy button to easily test the generated token.

## Building the Clerk SDK Locally (Optional)

If the Clerk Java SDK version is not available on Maven Central, you can build it locally:

```bash
# Clone the SDK repository
git clone https://github.com/clerk/clerk-sdk-java.git
cd clerk-sdk-java

# Build and install to local Maven repository (skip signing)
./gradlew publishToMavenLocal -Pskip.signing=true

# Verify installation
ls ~/.m2/repository/com/clerk/backend-api/
```

After building, the backend will automatically use the local version.

## Key Implementation Files

### Backend

- **`ClerkAuthFilter.java`** - JWT validation filter using Clerk SDK
- **`CorsConfig.java`** - CORS configuration for frontend communication
- **`ProtectedController.java`** - Example protected endpoints

### Frontend

- **`main.tsx`** - ClerkProvider setup with sign-in/sign-up URLs
- **`api/client.ts`** - Axios instance with auth token interceptor
- **`Dashboard.tsx`** - Example of fetching protected data
- **`Header.tsx`** - SignIn/SignUp/UserButton components

## Dependencies

### Backend (Maven)

```xml
<dependency>
    <groupId>com.clerk</groupId>
    <artifactId>backend-api</artifactId>
    <version>4.1.2</version>
</dependency>

<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```

### Frontend (npm)

```json
{
  "@clerk/clerk-react": "^5.x",
  "react-router-dom": "^7.x",
  "axios": "^1.x"
}
```

## Troubleshooting

### CORS Errors

Make sure the backend is running and the `CorsConfig.java` includes your frontend URL (default: `http://localhost:5173`).

### "Could not resolve placeholder 'CLERK_SECRET_KEY'"

Create a `.env` file in the backend directory with your Clerk secret key.

### SDK Not Found in Maven Central

Build the SDK locally following the instructions above.
