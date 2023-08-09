


--מגישים עמית מיירנץ' ואליהו ענבי
/*
use master
go
drop database Tremp_Boss_DB
go
*/

--#####################
--הגדרת מסד הנתונים
--#####################

/*
--Create database--
CREATE DATABASE Tremp_Boss_DB
COLLATE Hebrew_CI_AS;
GO

-- Create table for genders
USE Tremp_Boss_DB;
GO
*/



--טבלת יוזרים \ משתמשים 
CREATE TABLE Users (
    user_Id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) NOT NULL UNIQUE,
    phone_number NVARCHAR(10), 
    password NVARCHAR(max)  not null, 
    image_URL NVARCHAR(MAX),
    first_name  NVARCHAR(50),
    last_name NVARCHAR(50),
    gender NVARCHAR(1),
    coins INT DEFAULT 0,
    created_date DATETIME NOT NULL DEFAULT GETDATE(),
    update_date DATETIME NOT NULL DEFAULT GETDATE(),
    last_login_date DATETIME,
    deleted BIT NOT NULL DEFAULT 0,
    notification_token NVARCHAR(MAX)
);
go


-- טבלת סוגי הקבוצות
--קבוצה מסוג 1 - זו קבוצה מסוג כללי שלכל משתמש יש שם רואים את כל הנסיעות והמיקומים 
--קבוצה מסוג 2 זו קבוצה על פי ערים בכל קבוצה יהיו מיקומים פופלרים בהתאם
-- קבוצה מסוג 3 זו קבוצה שמשתמשים מבקשים לפתוח בהתאם למקום עבודה או מקום לימודים וכו שם יש מנהלי קבוצה 
-- בקבוצה 1 ו2 מנהל הקבוצה זה מנהל המערכת 
CREATE TABLE Group_Type (
type_id INT IDENTITY(1,1) PRIMARY KEY,
type_name NVARCHAR(100) NOT NULL,
);
GO

--  טבלת קבוצות
CREATE TABLE Groups (
group_id INT IDENTITY(1,1) PRIMARY KEY,
group_name NVARCHAR(100) NOT NULL UNIQUE,
type_id INT,
status BIT NOT NULL DEFAULT 0,
CONSTRAINT FK_group_type FOREIGN KEY (type_id) REFERENCES group_type(type_id)
);
GO


-- טבלת משתמשים שמחוברים לקבוצות
CREATE TABLE User_Groups (
user_id int not null,
group_id int not null,
group_rating DECIMAL(2,1) NOT NULL DEFAULT 0 CHECK (group_rating >= 0 AND group_rating <= 5),
-- ניתו לנהל קבוצות מסוג 3 שאלו קבוצות שהיוזר מבקש לפתוח ולא קבצות מסוג 2 או 1 שאלו קבוצות מערכת שאותם מנהל המנהל מערכת 
user_role bit NOT NULL DEFAULT  0, --  0 for member 1 for group manager
request_date DATETIME NOT NULL DEFAULT GETDATE(),
approval_date DATETIME,
is_approved bit, -- 0 for not approved, 1 for approved
CONSTRAINT PK_user_groups PRIMARY KEY (user_id, group_id),
CONSTRAINT FK_user_groups_users FOREIGN KEY (user_id) REFERENCES users(user_id),
CONSTRAINT FK_user_groups_groups FOREIGN KEY (group_id) REFERENCES groups(group_id)
);
GO


-- טבלת הטרמפים
create TABLE Tremps (
tremp_id INT IDENTITY(1,1) PRIMARY KEY,
tremp_type BIT NOT NULL, -- 1 offer ride , 0 reqest for tremp
create_date DATETIME NOT NULL DEFAULT GETDATE(),
tremp_time DATETIME NOT NULL,
from_route NVARCHAR(100) NOT NULL,
to_route NVARCHAR(100) NOT NULL,
note NVARCHAR(MAX),
seats_amount INT NOT NULL,
is_full BIT NOT NULL DEFAULT 0,-- אם כול המקומות תפוסים יהיה 1 רלוונטי רק לסוג 1 לנהג שמציע נסיעה 
deleted BIT NOT NULL DEFAULT 0,
);
GO

-- טבלת משתמשים שבתוך הטרמפ
CREATE TABLE User_Tremps (
    tremp_id INT NOT NULL,
    user_id INT NOT NULL,
    created_ride BIT NOT NULL DEFAULT 0,-- 1 created-ride | 0 -- join-ride
    group_id INT NOT NULL DEFAULT 1,-- GENERAL group
    is_confirmed VARCHAR(10) NOT NULL DEFAULT 'pending',-- 'pending' | 'denied' | 'cancelled' | 'approved'
    CONSTRAINT PK_group_tremps PRIMARY KEY (tremp_id, user_id, created_ride),
    CONSTRAINT FK_group_tremps_tremps FOREIGN KEY (tremp_id) REFERENCES tremps(tremp_id),
    CONSTRAINT FK_group_tremps_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);
GO


--שינוי פורמט התאריך
Set DateFormat DMY
go


-- הזנת נתונים לטבלת סוגי הקבוצות 
INSERT INTO group_type (type_name)
VALUES ('GENERAL'),-- קבוצה כללית למשתמשים כולם מחוברים אליה אוטומטית ניתן לראות ממנה את כל המיקומים
       ('CITIES'), -- התחברות לקבוצה על פי עיר
       ('PRIVATE'); -- התחברות לקבוצה שמנוהלת ע"י מקום עבודה או לימודים 
go


 -- יצירת הקבוצה הכללית של כולם  רואים את כל המיקומים שבכל הקבוצות 
 -- באפליקציה האמיתית יראו בה את כל המיקומים דרך גוגל מפות 
INSERT INTO groups (group_name,type_id)
VALUES ('כללי',1)  --     
GO

-- Create the trigger
CREATE TRIGGER users_insert_trigger
ON [dbo].[users]
FOR INSERT
AS
BEGIN
    DECLARE @user_id INT
    
    SELECT @user_id = user_id FROM INSERTED
    
    INSERT INTO user_groups (user_id, group_id)
    VALUES (@user_id, 1)
END
GO


CREATE PROC Proc_Get_User
	@id int
as
SELECT User_Id, Email, Phone_Number, Password, image_url,
		First_Name, Last_Name, Gender, Coins, created_date
		FROM     Users
		WHERE User_Id = @id
go

--Drop PROC Proc_User_Registration
CREATE PROC Proc_User_Registration
    @Email NVARCHAR(100),
    @Password varchar(max)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Users WHERE email = @Email)
    BEGIN
        BEGIN TRANSACTION;

        INSERT INTO Users (Email, Password)
        VALUES (@Email, @Password);

        IF @@ROWCOUNT = 1
        BEGIN
            COMMIT TRANSACTION;
            RETURN 0; -- User added successfully
        END
        ELSE
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN 1; -- Error adding user
        END
    END
    ELSE
    BEGIN
        RETURN 2; -- Email already exists in Users table
    END
END
go

/*
exec  Proc_User_Registration 'Amit@gmail.com' , '123'
go
*/
/*
CREATE PROC Proc_Delete_User
    @id int not null
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Users WHERE User_Id = @id;
END
go
*/
-- EXEC Proc_Delete_User 2;



--drop PROC Proc_Update_User
CREATE PROC Proc_Update_User
    @user_id int,
    @email NVARCHAR(100) = NULL,
    @phone_number NVARCHAR(20) = NULL,
    @image_URL NVARCHAR(max) = NULL,
    @first_name NVARCHAR(50) = NULL,
    @last_name NVARCHAR(50) = NULL,
    @gender NVARCHAR(1) = NULL,
	@notification_token NVARCHAR(max) = NULL,
	@deleted BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingEmail NVARCHAR(100);
    DECLARE @ExistingPhoneNumber NVARCHAR(20);
    DECLARE @ExistingPassword NVARCHAR(max);
    DECLARE @ExistingPhotoUrl NVARCHAR(max);
    DECLARE @ExistingFirstName NVARCHAR(50);
    DECLARE @ExistingLastName NVARCHAR(50);
    DECLARE @ExistingGender NVARCHAR(1);
	DECLARE @ExistingNotificationToken NVARCHAR(max);
	DECLARE @ExistingDeleted BIT;

    SELECT
        @ExistingEmail = email,
        @ExistingPhoneNumber = phone_number,
        @ExistingPassword = Password,
        @ExistingPhotoUrl = image_URL,
        @ExistingFirstName = first_name,
        @ExistingLastName = last_name,
        @ExistingGender = gender,
		@ExistingNotificationToken = notification_token,
		@ExistingDeleted = deleted
    FROM Users
    WHERE User_Id = @user_id;

	UPDATE Users
    SET
        email = COALESCE(@email, @ExistingEmail),
        phone_Number = COALESCE(@phone_number, @ExistingPhoneNumber),
        image_URL = COALESCE(@image_URL, @ExistingPhotoUrl),
        first_Name = COALESCE(@first_name, @ExistingFirstName),
        last_Name = COALESCE(@last_name, @ExistingLastName),
        gender = COALESCE(@gender, @ExistingGender),
		notification_token = COALESCE(@notification_token, @ExistingNotificationToken),
		deleted = COALESCE(@deleted, @ExistingDeleted),
		update_date = GETDATE()
    WHERE User_Id = @user_id
END
go
--select * from users
/*
EXEC Proc_Update_User 7 , @Phone_Number = '0585600460';
go
*/

--drop PROC Proc_User_Login
CREATE PROC Proc_User_Login
    @Email VARCHAR(100),
    @UserId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email and deleted = 0)
    BEGIN
        -- Retrieve the user's ID
        SELECT @UserId = User_Id FROM Users WHERE Email = @Email;
		-- Update the last_login_date for the user
        UPDATE Users SET last_login_date = GETDATE()
        WHERE User_Id = @UserId
    END
    ELSE
    BEGIN
        SET @UserId = 0; --authentication failure
    END
END
go

/*
DECLARE @UserId INT;
EXEC Proc_User_Login
    @Email = 'ely@gmail.com',
    @Password = 'ely123',
    @UserId = @UserId OUTPUT;

SELECT @UserId;
*/


CREATE PROC Proc_Get_User_NotificationToken 
    @UserId INT
AS
BEGIN
    SELECT notification_token 
    FROM Users 
    WHERE user_Id = @UserId;
END
GO
/*
EXEC Proc_Get_User_NotificationToken 1
GO
*/

--##########################################################################################
--drop PROC Proc_Add_Tremp
CREATE PROC Proc_Add_Tremp
    @user_id INT,
    @tremp_type BIT,
    @tremp_time DATETIME,
    @from_route NVARCHAR(100),
    @to_route NVARCHAR(100),
    @note NVARCHAR(MAX) = '',
    @seats_amount INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the user exists
    IF NOT EXISTS (SELECT 1 FROM Users WHERE User_Id = @user_id)
    BEGIN
        RAISERROR('User does not exist.', 16, 1);
        RETURN 1; -- return 1 to indicate error
    END;
    
    INSERT INTO Tremps (tremp_type, tremp_time, from_route, to_route, note, seats_amount)
    VALUES (@tremp_type, @tremp_time, @from_route, @to_route, @note, @seats_amount);
    
    -- Retrieve the newly inserted tremp_id
    DECLARE @tremp_id INT;
    SET @tremp_id = SCOPE_IDENTITY();
    
    -- Add the tremp to User_Tremps table
    INSERT INTO User_Tremps (tremp_id, user_id, created_ride, group_id,is_confirmed)
    VALUES (@tremp_id, @user_id, 1, 1,'approved');
    
    -- Return 0 to indicate success
    RETURN 0; 
END;
GO

/*
EXEC Proc_Add_Tremp
    @user_id = 3, 
    @tremp_type = 1, 
    @tremp_time = '2023-05-15T10:00:00',
    @from_route = 'Origin',
    @to_route = 'Destination', 
    @note = 'Additional notes',
    @seats_amount = 2; 
go
*/





--DROP PROC Proc_Get_Tremps
CREATE PROC Proc_Get_Tremps
    @CreatorId INT,
    @TypeOfTremp BIT,
    @TrempTime DATETIME
AS
BEGIN
    SELECT 
        T.tremp_id,
        UT.group_id,
        T.tremp_type,
        T.create_date,
        T.tremp_time,
        T.from_route,
        T.to_route,
        T.note,
        T.seats_amount,
        U.user_id as creator_id,
        U.first_Name as creator_first_name,
        U.last_Name as creator_last_name,
        U.image_URL as creator_image_url,
        CASE 
            WHEN T.tremp_type = 1 THEN (SELECT COUNT(*) FROM User_Tremps UT2 WHERE UT2.tremp_id = T.tremp_id AND UT2.created_ride = 0) 
            ELSE 0 
        END as hitchhikers_count -- Count of hitchhikers who joined but did not create the ride, only for tremp_type = 1
    FROM 
        Tremps T
        INNER JOIN User_Tremps UT ON T.tremp_id = UT.tremp_id
        INNER JOIN Users U ON UT.user_id = U.user_Id
    WHERE 
        UT.user_id <> @CreatorId AND -- The user is not the creator
        UT.created_ride = 1 AND -- The user is the creator of the ride
        T.tremp_type = @TypeOfTremp AND -- Tremp is of the type user sent
        T.tremp_time >= @TrempTime AND -- Tremp is at least of the date user sent
        T.deleted = 0 AND -- Tremp is not deleted
        NOT EXISTS (
            SELECT 1 
            FROM User_Tremps UT2 
            WHERE UT2.tremp_id = T.tremp_id AND UT2.user_id = @CreatorId -- Check if user is already in this trip
        )
END
GO
/*
EXEC Proc_Get_Tremps @CreatorId = 8, @TypeOfTremp = 1, @TrempTime = '2023-04-17T14:59:41.159'
go
*/

--DROP PROC Proc_Add_User_To_Tremp
CREATE PROC Proc_Add_User_To_Tremp
    @TrempId INT,
    @UserId INT
AS
BEGIN
    -- Fetch the creator ID and check if the tremp is full
    DECLARE @CreatorId INT;
    DECLARE @SeatsTaken INT;
    DECLARE @SeatsAmount INT;
    DECLARE @IsFull BIT;

    -- Get the creator ID, available seats, and if the tremp is full
    SELECT 
        @CreatorId = user_id,
        @IsFull = T.is_full,
        @SeatsAmount = T.seats_amount
    FROM User_Tremps UT
    INNER JOIN Tremps T ON UT.tremp_id = T.tremp_id
    WHERE UT.tremp_id = @TrempId AND UT.created_ride = 1;

    -- Get the number of seats taken
    SELECT 
        @SeatsTaken = COUNT(user_id)
    FROM User_Tremps
    WHERE tremp_id = @TrempId;

    -- Check if the tremp is full
    IF @IsFull = 1
    BEGIN
        SELECT @UserId AS UserId;
        RETURN;
    END

    -- Check if the user is the creator of the tremp
    ELSE IF @UserId = @CreatorId
    BEGIN
        SELECT @UserId AS UserId;
        RETURN;
    END

    -- Check if the user is already in the tremp
    ELSE IF EXISTS (SELECT 1 FROM User_Tremps WHERE tremp_id = @TrempId AND user_id = @UserId)
    BEGIN
        SELECT @UserId AS UserId;
        RETURN;
    END

    ELSE
    BEGIN
        INSERT INTO User_Tremps (tremp_id, user_id, created_ride, group_id, is_confirmed)
        VALUES (@TrempId, @UserId, 0, 1, 'pending');

        -- Check if the tremp is now full
        IF (@SeatsTaken) >= @SeatsAmount
        BEGIN
            UPDATE Tremps
            SET is_full = 1
            WHERE tremp_id = @TrempId;
        END

        SELECT @CreatorId AS creator_id;
    END
END;
GO

/*
EXEC Proc_Add_User_To_Tremp @TrempId =10, @UserId = 11
GO
*/

--DROP PROC Proc_Approve_User_In_Tremp
CREATE PROC Proc_Approve_User_In_Tremp
    @TrempId INT,
    @CreatorId INT,
    @UserId INT,
    @Approval VARCHAR(10)
AS
BEGIN

    -- Check if the approver is the creator of the tremp
    IF EXISTS (SELECT 1 FROM User_Tremps WHERE tremp_id = @TrempId AND user_id = @CreatorId AND created_ride = 1)
    BEGIN
        -- If the approver is the creator, approve or deny the user on the tremp
        UPDATE User_Tremps
        SET is_confirmed = @Approval
        WHERE tremp_id = @TrempId AND user_id = @UserId AND created_ride = 0;
        
    END
    -- Return the value
END;
GO

/*
DECLARE @Result INT;
EXEC @Result = Proc_Approve_User_In_Tremp @TrempId =1, @CreatorId = 1,@UserId = 2, @Approval = 'approved';
SELECT @Result AS ReturnValue;
go
*/

-- DROP PROC Proc_Delete_Tremp
CREATE PROC Proc_Delete_Tremp
    @TrempId INT,
    @UserId INT
AS
BEGIN
    -- Check if the user is the creator of the tremp
    IF EXISTS (SELECT 1 FROM User_Tremps WHERE tremp_id = @TrempId AND user_id = @UserId AND created_ride = 1)
    BEGIN
        -- If the user is the creator, mark the tremp as deleted in the Tremps table
        UPDATE Tremps
        SET deleted = 1
        WHERE tremp_id = @TrempId;

        -- Select the IDs of all users who were part of the deleted tremp, excluding the creator
        SELECT user_id FROM User_Tremps 
        WHERE tremp_id = @TrempId AND user_id != @UserId;
    END
    ELSE
    BEGIN
        -- If the user is not the creator but is part of the ride, update the is_confirmed field to "cancelled"
        IF EXISTS (SELECT 1 FROM User_Tremps WHERE tremp_id = @TrempId AND user_id = @UserId)
        BEGIN
            UPDATE User_Tremps
            SET is_confirmed = 'cancelled'
            WHERE tremp_id = @TrempId AND user_id = @UserId;

            -- Return the ID of the creator of the ride
            SELECT user_id FROM User_Tremps
            WHERE tremp_id = @TrempId AND created_ride = 1;
        END
        ELSE
        BEGIN
            -- If the user is neither the creator nor part of the ride, raise an error
            RAISERROR ('The user is not the creator nor part of the tremp.', 16, 1);
        END
    END
END;
GO


/*
EXEC DeleteTremp @TrempId =1, @CreatorId = 1;
GO
*/
 
/*
select * from Users
select * from User_Groups
select * from tremps
select * from User_Tremps
*/
