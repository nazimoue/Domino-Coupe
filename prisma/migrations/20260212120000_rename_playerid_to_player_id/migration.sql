-- Rename column playerId to player_id in Score table
PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- Create new table with correct column name
CREATE TABLE "_Score_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "player_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "day" INTEGER,
    CONSTRAINT "Score_playerId_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data
INSERT INTO "_Score_new" ("id", "player_id", "points", "type", "date", "day")
SELECT "id", "playerId", "points", "type", "date", "day" FROM "Score";

-- Drop old table
DROP TABLE "Score";

-- Rename new table
ALTER TABLE "_Score_new" RENAME TO "Score";

COMMIT;

PRAGMA foreign_keys=on;
