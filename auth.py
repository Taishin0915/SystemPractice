from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from models import User, UserRole

class UserLogin(UserMixin):
    """Flask-Login用のユーザークラス"""
    def __init__(self, user: User):
        self.id = user.id
        self.username = user.username
        self.email = user.email
        self.role = user.role
        self._user = user
    
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
    def get_user(self):
        return self._user

def hash_password(password: str) -> str:
    """パスワードをハッシュ化"""
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(password_hash: str, password: str) -> bool:
    """パスワードを検証"""
    return check_password_hash(password_hash, password)

def get_user_by_username(db, username: str):
    """ユーザー名でユーザーを取得"""
    return db.query(User).filter_by(username=username).first()

def get_user_by_email(db, email: str):
    """メールアドレスでユーザーを取得"""
    return db.query(User).filter_by(email=email).first()

def get_user_by_id(db, user_id: int):
    """IDでユーザーを取得"""
    return db.query(User).filter_by(id=user_id).first()

