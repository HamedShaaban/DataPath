CREATE TABLE `localAccounts` (
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `localAccounts_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `localAccounts_email_unique` UNIQUE(`email`)
);
