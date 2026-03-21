-- CreateTable
CREATE TABLE "PortfolioMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "investable" REAL NOT NULL DEFAULT 0,
    "property" REAL NOT NULL DEFAULT 0,
    "debt" REAL NOT NULL DEFAULT 0,
    "sourceMtimeMs" BIGINT NOT NULL DEFAULT 0,
    "sourceUpdatedAt" TEXT,
    "lastSyncedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioHolding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "value" REAL NOT NULL DEFAULT 0,
    "quantity" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortfolioTrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holdingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioTrade_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "PortfolioHolding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
