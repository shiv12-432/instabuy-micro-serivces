CREATE DATABASE  IF NOT EXISTS `instabuy_oms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `instabuy_oms`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: instabuy_oms
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `shipment_package_requests`
--

DROP TABLE IF EXISTS `shipment_package_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_package_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_limit` int NOT NULL,
  `package_name` varchar(255) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `requested_at` datetime(6) NOT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `seller_id` bigint NOT NULL,
  `status` enum('REQUESTED','APPROVED','REJECTED') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_package_requests`
--

LOCK TABLES `shipment_package_requests` WRITE;
/*!40000 ALTER TABLE `shipment_package_requests` DISABLE KEYS */;
INSERT INTO `shipment_package_requests` VALUES (1,10,'10 orders shipment',399.00,'2026-05-25 06:46:56.772149','2026-05-25 10:38:06.554790',2,'APPROVED'),(2,25,'25 orders shipment',799.00,'2026-05-25 10:01:27.924121','2026-05-25 10:38:08.758694',2,'APPROVED'),(3,10,'10 orders shipment',399.00,'2026-05-25 15:24:30.747244','2026-05-25 15:41:36.026320',3,'REJECTED'),(4,25,'25 orders shipment',799.00,'2026-05-25 15:24:37.759382','2026-05-25 15:41:37.837789',3,'APPROVED'),(5,50,'50 orders shipment',1499.00,'2026-05-25 15:24:40.431184','2026-05-25 15:41:39.823324',3,'REJECTED'),(6,10,'10 orders shipment',399.00,'2026-05-26 13:14:31.251642','2026-05-26 13:22:21.628512',18,'APPROVED'),(7,10,'10 orders shipment',399.00,'2026-06-09 12:51:27.507832','2026-06-09 13:09:25.550349',3,'APPROVED');
/*!40000 ALTER TABLE `shipment_package_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-18 17:51:11
