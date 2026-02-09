-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "deletedAt" DATETIME;
