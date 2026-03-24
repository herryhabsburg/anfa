-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StockTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "operator" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockTransaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StockTransaction" ("assetId", "createdAt", "id", "note", "operator", "quantity", "type") SELECT "assetId", "createdAt", "id", "note", "operator", "quantity", "type" FROM "StockTransaction";
DROP TABLE "StockTransaction";
ALTER TABLE "new_StockTransaction" RENAME TO "StockTransaction";
CREATE INDEX "StockTransaction_assetId_createdAt_idx" ON "StockTransaction"("assetId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
