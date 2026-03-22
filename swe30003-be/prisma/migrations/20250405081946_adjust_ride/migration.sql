/*
  Warnings:

  - Added the required column `price` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'CAR', 'LUXURY');

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR',
ALTER COLUMN "status" SET DEFAULT 'PENDING';
