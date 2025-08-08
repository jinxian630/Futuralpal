-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oidcSub" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "picture" TEXT,
    "primaryWalletAddress" TEXT,
    "nftPoints" INTEGER NOT NULL DEFAULT 0,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "isFirstTime" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME
);

-- CreateTable
CREATE TABLE "AuthChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oidcSub" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_oidcSub_key" ON "User"("oidcSub");

-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_challenge_key" ON "AuthChallenge"("challenge");

-- CreateIndex
CREATE INDEX "AuthChallenge_oidcSub_idx" ON "AuthChallenge"("oidcSub");

-- CreateIndex
CREATE INDEX "AuthChallenge_challenge_idx" ON "AuthChallenge"("challenge");
