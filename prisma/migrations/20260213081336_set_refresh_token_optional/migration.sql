-- AlterTable
ALTER TABLE "user_sessions" ALTER COLUMN "refresh_token" DROP NOT NULL,
ALTER COLUMN "expires_at" DROP NOT NULL,
ALTER COLUMN "revoked_at" DROP NOT NULL;
