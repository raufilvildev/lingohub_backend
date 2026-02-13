/*
  Warnings:

  - Added the required column `updated_at` to the `user_sessions` table without a default value. This is not possible if the table is not empty.
  - Made the column `device_info` on table `user_sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ip` on table `user_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "device_info" SET NOT NULL,
ALTER COLUMN "ip" SET NOT NULL;
