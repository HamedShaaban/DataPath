CREATE TABLE `learningStates` (
	`userId` int NOT NULL,
	`stateJson` text NOT NULL,
	`revision` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningStates_userId` PRIMARY KEY(`userId`)
);
