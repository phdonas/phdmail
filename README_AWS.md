# Professional Backend Setup (AWS SES + Celery)

This setup uses **AWS SES** for high-deliverability emails and **Celery + Redis** for a robust, non-blocking queue system.

## 1. Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **Redis**: You need a running Redis instance.
    -   **Option A (Docker - Recommended)**:
        1.  Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
        2.  Open Docker Desktop and ensure it's running.
        3.  Open a terminal (PowerShell or CMD) and run:
            ```bash
            docker run --name redis -p 6379:6379 -d redis
            ```
            docker run --name redis -p 6379:6379 -d redis
            ```
        4.  This command downloads Redis and runs it in the background on port 6379.
        5.  **Troubleshooting**:
            -   **"Command not found"**: Close specific terminal window and open a new one (PowerShell/CMD) to refresh your system paths.
            -   **Docker Desktop**: Ensure the Docker Desktop application is actually open and the status bar (bottom left) is green.
    -   **Option B (WSL 2)**: Open your Ubuntu terminal and run `sudo apt install redis-server`.
    -   **Option C (Native Windows)**: Install [Memurai Developer](https://www.memurai.com/get-memurai) (Redis-compatible for Windows).
    -   **Verify**: Ensure `redis-cli ping` returns `PONG`.

## 2. AWS SES Configuration

1.  **Verify Identity**:
    -   Go to AWS Console -> Simple Email Service (SES).
    -   **Verified Identities** -> Create Identity.
    -   Select **Email Address** (easiest for starting) or **Domain**.
    -   Verify the email address (click the link sent to your inbox).
2.  **Get Credentials**:
    -   Go to IAM (Identity and Access Management).
    -   Users -> Create User -> "ses-sender".
    -   Permissions: Attach existing policies -> `AmazonSESFullAccess`.
    -   Create Access Key -> **Save Access Key ID and Secret Access Key**.

## 3. Backend Configuration

Create a `.env` file in `c:/Projetos/phdmail/backend/.env`:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
SES_REGION=us-east-1
SENDER_EMAIL=your-verified-email@example.com

# Redis URL (Default is localhost)
REDIS_URL=redis://localhost:6379/0

# Firebase (Same as before)
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
```

## 4. Running the System

You need **two** terminal windows running in the `backend/` directory:

**Terminal 1: Celery Worker** (Processes the emails)
```bash
# Windows
celery -A celery_app worker --pool=solo --loglevel=info
# Linux/WSL
celery -A celery_app worker --loglevel=info
```

**Terminal 2: Orchestrator** (Watches for new campaigns)
```bash
python main.py
```

## 5. GitHub CI/CD

To enable auto-deployment:
1.  Go to your GitHub Repo -> Settings -> Secrets and variables -> Actions.
2.  Add New Repository Secret: `FIREBASE_SERVICE_ACCOUNT_PHDMAI`.
3.  Value: The content of your `serviceAccountKey.json`.
