-- 図書館予約管理システム データベーススキーマ
-- 参考用: SQLAlchemyが自動的にテーブルを作成するため、このファイルは参考用です

CREATE DATABASE IF NOT EXISTS library_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_system;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 書籍テーブル
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    publisher VARCHAR(100),
    publication_date DATE,
    total_copies INT DEFAULT 1 NOT NULL,
    available_copies INT DEFAULT 1 NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 予約テーブル
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending' NOT NULL,
    expiry_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- 貸出テーブル
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date DATETIME NOT NULL,
    return_date DATETIME,
    status ENUM('active', 'returned', 'overdue') DEFAULT 'active' NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_book ON reservations(book_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_book ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);

