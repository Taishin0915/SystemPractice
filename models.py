from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date, timedelta
from database import Base
import enum

class UserRole(enum.Enum):
    USER = 'user'
    ADMIN = 'admin'

class ReservationStatus(enum.Enum):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    CANCELLED = 'cancelled'

class LoanStatus(enum.Enum):
    ACTIVE = 'active'
    RETURNED = 'returned'
    OVERDUE = 'overdue'

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーション
    reservations = relationship('Reservation', back_populates='user', cascade='all, delete-orphan')
    loans = relationship('Loan', back_populates='user', cascade='all, delete-orphan')
    
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
    def __repr__(self):
        return f'<User {self.username}>'

class Book(Base):
    __tablename__ = 'books'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    isbn = Column(String(20), unique=True, nullable=True)
    publisher = Column(String(100), nullable=True)
    publication_date = Column(Date, nullable=True)
    total_copies = Column(Integer, default=1, nullable=False)
    available_copies = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーション
    reservations = relationship('Reservation', back_populates='book', cascade='all, delete-orphan')
    loans = relationship('Loan', back_populates='book', cascade='all, delete-orphan')
    
    def is_available(self):
        return self.available_copies > 0
    
    def __repr__(self):
        return f'<Book {self.title}>'

class Reservation(Base):
    __tablename__ = 'reservations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    book_id = Column(Integer, ForeignKey('books.id'), nullable=False)
    reservation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    
    # リレーション
    user = relationship('User', back_populates='reservations')
    book = relationship('Book', back_populates='reservations')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.expiry_date:
            # 予約の有効期限は7日後
            self.expiry_date = datetime.utcnow() + timedelta(days=7)
    
    def is_expired(self):
        return datetime.utcnow() > self.expiry_date
    
    def __repr__(self):
        return f'<Reservation {self.id} - User {self.user_id} - Book {self.book_id}>'

class Loan(Base):
    __tablename__ = 'loans'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    book_id = Column(Integer, ForeignKey('books.id'), nullable=False)
    loan_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(Enum(LoanStatus), default=LoanStatus.ACTIVE, nullable=False)
    
    # リレーション
    user = relationship('User', back_populates='loans')
    book = relationship('Book', back_populates='loans')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.due_date:
            # 貸出期限は14日後
            self.due_date = datetime.utcnow() + timedelta(days=14)
    
    def is_overdue(self):
        if self.status == LoanStatus.RETURNED:
            return False
        return datetime.utcnow() > self.due_date
    
    def __repr__(self):
        return f'<Loan {self.id} - User {self.user_id} - Book {self.book_id}>'

