-- PostgreSQL migration for Supabase
CREATE TABLE "Player" (
  "id" SERIAL PRIMARY KEY,
  "prenom" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "niveau" TEXT NOT NULL DEFAULT 'MEDIOCRE',
  "matches_played" INTEGER NOT NULL DEFAULT 0,
  "photo" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "Score" (
  "id" SERIAL PRIMARY KEY,
  "player_id" INTEGER NOT NULL,
  "points" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "date" TIMESTAMP NOT NULL DEFAULT now(),
  "day" INTEGER,
  CONSTRAINT "Score_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
