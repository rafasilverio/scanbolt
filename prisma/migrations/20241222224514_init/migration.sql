/*
  Warnings:

  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('draft', 'under_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('draft', 'under_review', 'approved', 'rejected');

-- DropForeignKey
ALTER TABLE "public"."Contract" DROP CONSTRAINT "Contract_userId_fkey";

-- DropTable
DROP TABLE "public"."Contract";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."Status";

-- DropEnum
DROP TYPE "public"."contract_status";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "contracts_remaining" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'credentials',
    "role" "Role" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewContract" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreviewContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewHighlight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "startIndex" INTEGER NOT NULL,
    "endIndex" INTEGER NOT NULL,
    "suggestion" TEXT,
    "contractId" TEXT NOT NULL,

    CONSTRAINT "PreviewHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "changes" TEXT NOT NULL DEFAULT '[]',
    "pdfPositions" JSONB,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "startIndex" INTEGER NOT NULL,
    "endIndex" INTEGER NOT NULL,
    "suggestion" TEXT,
    "contractId" TEXT NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- AddForeignKey
ALTER TABLE "PreviewHighlight" ADD CONSTRAINT "PreviewHighlight_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "PreviewContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
