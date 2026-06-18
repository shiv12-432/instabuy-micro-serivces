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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','Admin','$2a$10$iLaWVdWoip4qmr5YYwgAl.phLPHXfYLOxgxBFCenRS2k1vrzAejES','ADMIN'),(2,'dravan268@gmail.com','dravan','$2a$10$QuKEoZuNF5T35BK6c2hGVO7GLzQz0VP89xQJU99plbKoMy71/8hZS','SELLER'),(3,'shivane5600@gmail.com','shivane','$2a$10$7MUeSsnRr0.MjYdEFC6NEO7OuqaUBxPAcBd8DNI/Sw/FCz8FBqlWq','SELLER'),(4,'kanavsobti@gmail.com','Kanav','$2a$10$seeQohpSTXUigCn1.8oplOnmAc0RPfG8.Ef2NNG.kRBurgQ7oRsbW','SELLER'),(5,'shiv@gmail.com','shiv','$2a$10$JLZTMWE4AYvg8oeuxFFDNeEKqWfsIbBON1/r5xjt49UUEXQc4PGuO','CUSTOMER'),(6,'shivane@gmail.com','shivane','$2a$10$0/FgllX.rbr7HIz5MJTwtejBxwgeQBWKKu7xPAUyLr0Uv91EpKcTy','CUSTOMER'),(7,'kanav@gmail.com','kanav','$2a$10$h9JEqO9MLa6SOZGFN2xptOLRUz9qxWal/mf.cilUp5zQG8OmQEq22','CUSTOMER'),(8,'shankar@gmail.com','shankar','$2a$10$Rcqb3rimqkb.dj9Jwdx8xOV3xyPOOe6HhR0X2UHs2kXqyCmlONSry','CUSTOMER'),(11,'shivani@gmail.com','shivani','$2a$10$PMv9O5rmgbHsuGEWzkg1pOkFhrIvdrP91MWxiq9c3saaSX.KipPOW','CUSTOMER'),(13,'shivam@gmail.com','shivam','$2a$10$OpoSjWKlZaukziHZIfaY4edzTuJUMRRB70KRG7v/B6xUHpaRREkV2','CUSTOMER'),(14,'pankaj@gmail.com','pankaj','$2a$10$gR3Oct2M4E8srpXu33vnkeQEJ5Ah5EzVOcocS8OPrLED9IDVjClU6','CUSTOMER'),(15,'naman@gmail.com','naman','$2a$10$T4jbG4Z9reP6KKWmETNwlO2RspZEMfiQf1E0yAwdPdWTWpWJJ5MaK','CUSTOMER'),(16,'sachin@gmail.com','sachin','$2a$10$mVImW5pPovAwVFoza1FYhuf7TcludXZ9Wcg.p8lLiYLcLENI8.NLO','SELLER'),(17,'lloydtv43@gmail.com','Shiv Khanna','$2a$10$5E892q/9oJNeDOy7VBlg5.8SJGqIJ2JNdQcxoxqAJXzoAFIaNbURa','CUSTOMER'),(18,'rahul@gmail.com','Rahul Kumar','$2a$10$qIDTDjtQEBc2HIscJ21njOVfJIQkoSw2fPuSiLJMCdIibyXLswJiW','SELLER'),(19,'pan@gmail.com','pan','$2a$10$JknFupZakNmZaRS0mA2D8ekoa97yYFWKx5AebR7NedByFRSnAObIm','CUSTOMER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-18 17:51:10
