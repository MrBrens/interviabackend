-- Create Discussions table
CREATE TABLE IF NOT EXISTS Discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    userId INT NOT NULL,
    status ENUM('active', 'archived') DEFAULT 'active',
    lastMessageAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    cv_skills TEXT,
    cv_experience TEXT,
    cv_education TEXT,
    cv_summary TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Messages table
CREATE TABLE IF NOT EXISTS Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discussionId INT NOT NULL,
    role ENUM('user', 'ai') NOT NULL,
    type ENUM('text', 'vocal') NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    audioUrl VARCHAR(255),
    label VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (discussionId) REFERENCES Discussions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_discussions_userId ON Discussions(userId);
CREATE INDEX idx_discussions_lastMessageAt ON Discussions(lastMessageAt);
CREATE INDEX idx_messages_discussionId ON Messages(discussionId);
CREATE INDEX idx_messages_createdAt ON Messages(createdAt);

-- Add phoneNumber column to Users table
ALTER TABLE Users
ADD COLUMN phoneNumber VARCHAR(255) NULL,
ADD CONSTRAINT phone_number_format CHECK (phoneNumber REGEXP '^\+?[0-9\\s-()]+$');

-- Add index for phone number searches
CREATE INDEX idx_phone_number ON Users(phoneNumber);

-- Create Plans table
CREATE TABLE IF NOT EXISTS Plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL, -- in days
    features TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Subscriptions table
CREATE TABLE IF NOT EXISTS Subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    planId INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (planId) REFERENCES Plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default plans
INSERT INTO Plans (name, description, price, duration, features) VALUES
('Gratuit', 'Plan de base avec fonctionnalités limitées', 0.00, 30, '{"interviews": 3, "storage": "100MB", "support": "Email"}'),
('Pro', 'Plan professionnel avec fonctionnalités avancées', 19.99, 30, '{"interviews": "Illimité", "storage": "1GB", "support": "Prioritaire"}'),
('Entreprise', 'Solution complète pour les entreprises', 49.99, 30, '{"interviews": "Illimité", "storage": "10GB", "support": "24/7", "team": true}');

-- Add indexes for better performance
CREATE INDEX idx_subscriptions_userId ON Subscriptions(userId);
CREATE INDEX idx_subscriptions_planId ON Subscriptions(planId);
CREATE INDEX idx_subscriptions_status ON Subscriptions(status);

-- Create Meetings table
CREATE TABLE IF NOT EXISTS Meetings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    duration INT NOT NULL,
    type ENUM('technical', 'behavioral', 'hr') NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_meetings_userId ON Meetings(userId);
CREATE INDEX idx_meetings_date ON Meetings(date);
CREATE INDEX idx_meetings_status ON Meetings(status); 