CREATE DATABASE  IF NOT EXISTS `instabuy_inventory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `instabuy_inventory`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: instabuy_inventory
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
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `product_id` bigint NOT NULL,
  `seller_id` bigint NOT NULL DEFAULT '0',
  `sku` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ce3rbi3bfstbvvyne34c1dvyv` (`product_id`),
  UNIQUE KEY `UK_eag2bhmi718kn4wty1uss3rp3` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (4,'Apple iPhone',90000.00,1,6,'IPH-APL-001',97),(5,'Vaku Luxos',2000.00,2,6,'VAK-SONAIR-TWS-001',30),(7,' Cotton Jersey T-Shirt ',890.00,3,6,'WOM-TSH-OVR-001',23),(8,'Wired Earphones ',3999.00,4,6,'EAR-NIN-001',23),(9,'Olay Regenerist Retinol',1690.00,5,6,'OL-R24-NC-50G',23),(10,' Lakme Xtraordin-airy ',345.00,6,6,' LK-XAMM-05-BH-25G',19),(11,'Relief Sun Aqua-Fresh',2365.00,7,6,' BOJ-RS-AF-50SPF',54),(12,'Showstopper Microfiber ',564.00,8,6,' SS-MC-12PK',23),(13,'Body Fat Analyzer',2300.00,9,6,'DT-526-BMI-SCALE',23),(14,'Artificial Plants with Pot',1234.00,10,6,' AB-AP-MV-DECOR',20),(15,'Steel Frying Pan ',2076.00,11,6,'PNB-KM-TP-FP20',54),(16,' Pull Up Exercise Band',3456.00,12,6,' FX-RB-PULLUP',21),(17,' Yoga Pedal Puller',1267.00,13,6,' SP-TT-YPP-RES',12),(18,'M1A USB Speakerphone',5426.00,14,6,'EM-M1A-SPK',21),(19,'925 Silver Golden Glint',9990.00,15,6,'SG-925-PENDANT-GLINT',43),(20,'Gold Magnet Watch ',457.00,16,6,'RG-MAG-WATCH-W',87),(21,'Apple iPhone 17 Pro Max',99999.00,17,6,'APP-IP17PM-2TB',23),(22,'OnePlus 15R 12GB RAM ',89000.00,18,6,'OP-15R-12GB-512GB-CB',32),(23,' OnePlus Nord CE6 8GB ',55000.00,19,7,'OP-NCE6-8GB-128GB-PB',30),(24,' realme NARZO 80 Pro',46000.00,20,7,'RM-NARZO80P-12GB',31),(25,'realme NARZO 90 5G 8GB',30000.00,21,7,'RM-NARZO90-8GB-128GB',44),(26,'Muze Bluetooth Earbuds ',4300.00,22,7,'AC-MUZE-BT-EB',32),(27,'Music Player Sunset Red',3698.00,23,7,'SG-CARVAAN-MINI2-TEL',21),(28,'Audio Array AI-04 HD',6789.00,24,7,'AA-AI04-HD-G3',18),(29,'Printed Anarkali Kurta',1236.00,25,7,' WR-ANRK-SET-PRINT',9),(30,'Cotton Blend Casual Shirt',890.00,26,7,' MS-CB-CASUAL-FS',34),(31,'T-Shirt for Men Oversized',890.00,27,7,' MH-BAGGY-GRAPHIC-TS',30),(32,' Lotion Madurai Jasmine ',4390.00,28,7,'FE-LDL-JM-SPF30',26),(33,'Liss Unlimited Hair Mask',3499.00,29,7,'LP-LISS-MASK-200',32),(34,'Gift Set In Berries',5400.00,30,7,'HY-VK-GS-BER',23),(35,'Chitshakti Crystal Tree',3461.00,31,7,' CS-ECT-500',21),(36,'Pure Kalpavriksha Tree',2340.00,32,7,'BK-KT-6IN',34),(37,'Kitchen Shelf Wall Mount',4590.00,33,7,'DJ-KS-WM-MULTI',29),(38,'Boldfit Abs Roller for Men',987.00,34,7,'BF-ABS-ROLLER',11),(39,'Cup Sit-Up Bar',5432.00,35,7,'SP-ABS-SUCTION',5),(41,' Mini Cycle Pedal',2999.00,37,7,'SMB-100-MN',29);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
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
