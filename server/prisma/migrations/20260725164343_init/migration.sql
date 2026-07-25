-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "store" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "value" TEXT,
    "expiry" DATETIME,
    "code" TEXT,
    "codeType" TEXT,
    "notes" TEXT,
    "imagePath" TEXT,
    "imageIsPdfSourced" BOOLEAN NOT NULL DEFAULT false,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
