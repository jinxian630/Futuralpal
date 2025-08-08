-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oidcSub" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "picture" TEXT,
    "primaryWalletAddress" TEXT,
    "loginType" TEXT NOT NULL DEFAULT 'zklogin',
    "nftPoints" INTEGER NOT NULL DEFAULT 0,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "isFirstTime" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME
);
INSERT INTO "new_User" ("admin", "createdAt", "displayName", "email", "id", "isFirstTime", "lastLogin", "nftPoints", "oidcSub", "picture", "primaryWalletAddress") SELECT "admin", "createdAt", "displayName", "email", "id", "isFirstTime", "lastLogin", "nftPoints", "oidcSub", "picture", "primaryWalletAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_oidcSub_key" ON "User"("oidcSub");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
