-- CreateTable
CREATE TABLE IF NOT EXISTS "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "selectedFrequency" TEXT NOT NULL DEFAULT 'Every sprint',
    "morningBriefTime" TEXT NOT NULL DEFAULT '07:00',
    "marketBriefTime" TEXT NOT NULL DEFAULT '08:30',
    "modelKarl" TEXT NOT NULL DEFAULT 'gpt-5.3-codex',
    "modelHex" TEXT NOT NULL DEFAULT 'gpt-5.3-codex',
    "modelWarren" TEXT NOT NULL DEFAULT 'gpt-5.3-codex',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO "AppSettings" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP);
