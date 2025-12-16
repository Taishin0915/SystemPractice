from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy import or_, func
from datetime import datetime, timedelta
from database import init_db, get_db, SessionLocal
from models import User, Book, Reservation, Loan, UserRole, ReservationStatus, LoanStatus
from auth import UserLogin, hash_password, verify_password, get_user_by_username, get_user_by_email, get_user_by_id
import os

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Flask-Loginの設定
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'ログインが必要です。'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    db = next(get_db())
    user = get_user_by_id(db, int(user_id))
    db.close()
    if user:
        return UserLogin(user)
    return None

# データベース初期化
init_db(app)

# ==================== 認証関連 ====================

@app.route('/')
def index():
    """ホームページ"""
    return redirect(url_for('book_list'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    """ユーザー登録"""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if not username or not email or not password:
            flash('すべての項目を入力してください。', 'error')
            return render_template('auth/register.html')
        
        if password != confirm_password:
            flash('パスワードが一致しません。', 'error')
            return render_template('auth/register.html')
        
        db = SessionLocal()
        try:
            # ユーザー名とメールアドレスの重複チェック
            if get_user_by_username(db, username):
                flash('このユーザー名は既に使用されています。', 'error')
                return render_template('auth/register.html')
            
            if get_user_by_email(db, email):
                flash('このメールアドレスは既に使用されています。', 'error')
                return render_template('auth/register.html')
            
            # 新規ユーザー作成
            new_user = User(
                username=username,
                email=email,
                password_hash=hash_password(password),
                role=UserRole.USER
            )
            db.add(new_user)
            db.commit()
            
            flash('登録が完了しました。ログインしてください。', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.rollback()
            flash(f'登録中にエラーが発生しました: {str(e)}', 'error')
        finally:
            db.close()
    
    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """ログイン"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('ユーザー名とパスワードを入力してください。', 'error')
            return render_template('auth/login.html')
        
        db = SessionLocal()
        try:
            user = get_user_by_username(db, username)
            if user and verify_password(user.password_hash, password):
                login_user(UserLogin(user))
                flash('ログインしました。', 'success')
                next_page = request.args.get('next')
                return redirect(next_page or url_for('book_list'))
            else:
                flash('ユーザー名またはパスワードが正しくありません。', 'error')
        finally:
            db.close()
    
    return render_template('auth/login.html')

@app.route('/logout')
@login_required
def logout():
    """ログアウト"""
    logout_user()
    flash('ログアウトしました。', 'info')
    return redirect(url_for('login'))

# ==================== 書籍関連 ====================

@app.route('/books')
def book_list():
    """書籍一覧"""
    db = SessionLocal()
    try:
        page = request.args.get('page', 1, type=int)
        per_page = 20
        search_query = request.args.get('q', '')
        
        query = db.query(Book)
        
        if search_query:
            query = query.filter(
                or_(
                    Book.title.like(f'%{search_query}%'),
                    Book.author.like(f'%{search_query}%'),
                    Book.isbn.like(f'%{search_query}%')
                )
            )
        
        books = query.order_by(Book.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        total = query.count()
        
        return render_template('books/list.html', books=books, page=page, 
                             per_page=per_page, total=total, search_query=search_query)
    finally:
        db.close()

@app.route('/books/<int:book_id>')
def book_detail(book_id):
    """書籍詳細"""
    db = SessionLocal()
    try:
        book = db.query(Book).filter_by(id=book_id).first()
        if not book:
            flash('書籍が見つかりません。', 'error')
            return redirect(url_for('book_list'))
        
        # ユーザーが既に予約しているかチェック
        has_reservation = False
        if current_user.is_authenticated:
            reservation = db.query(Reservation).filter_by(
                user_id=current_user.id,
                book_id=book_id,
                status=ReservationStatus.PENDING
            ).first()
            has_reservation = reservation is not None
        
        return render_template('books/detail.html', book=book, has_reservation=has_reservation)
    finally:
        db.close()

@app.route('/books/<int:book_id>/reserve', methods=['POST'])
@login_required
def reserve_book(book_id):
    """書籍を予約"""
    db = SessionLocal()
    try:
        book = db.query(Book).filter_by(id=book_id).first()
        if not book:
            flash('書籍が見つかりません。', 'error')
            return redirect(url_for('book_list'))
        
        if not book.is_available():
            flash('この書籍は現在利用できません。', 'error')
            return redirect(url_for('book_detail', book_id=book_id))
        
        # 既に予約していないかチェック
        existing_reservation = db.query(Reservation).filter_by(
            user_id=current_user.id,
            book_id=book_id,
            status=ReservationStatus.PENDING
        ).first()
        
        if existing_reservation:
            flash('既にこの書籍を予約しています。', 'error')
            return redirect(url_for('book_detail', book_id=book_id))
        
        # 予約作成
        reservation = Reservation(
            user_id=current_user.id,
            book_id=book_id,
            status=ReservationStatus.PENDING
        )
        db.add(reservation)
        db.commit()
        
        flash('予約が完了しました。', 'success')
        return redirect(url_for('book_detail', book_id=book_id))
    except Exception as e:
        db.rollback()
        flash(f'予約中にエラーが発生しました: {str(e)}', 'error')
    finally:
        db.close()
    
    return redirect(url_for('book_detail', book_id=book_id))

# ==================== 予約関連 ====================

@app.route('/reservations')
@login_required
def reservation_list():
    """予約一覧"""
    db = SessionLocal()
    try:
        if current_user.is_admin():
            reservations = db.query(Reservation).order_by(Reservation.reservation_date.desc()).all()
        else:
            reservations = db.query(Reservation).filter_by(
                user_id=current_user.id
            ).order_by(Reservation.reservation_date.desc()).all()
        
        return render_template('reservations/list.html', reservations=reservations)
    finally:
        db.close()

@app.route('/reservations/<int:reservation_id>/cancel', methods=['POST'])
@login_required
def cancel_reservation(reservation_id):
    """予約をキャンセル"""
    db = SessionLocal()
    try:
        reservation = db.query(Reservation).filter_by(id=reservation_id).first()
        if not reservation:
            flash('予約が見つかりません。', 'error')
            return redirect(url_for('reservation_list'))
        
        # 権限チェック（本人または管理者のみ）
        if not current_user.is_admin() and reservation.user_id != current_user.id:
            flash('権限がありません。', 'error')
            return redirect(url_for('reservation_list'))
        
        if reservation.status == ReservationStatus.CANCELLED:
            flash('この予約は既にキャンセルされています。', 'error')
            return redirect(url_for('reservation_list'))
        
        reservation.status = ReservationStatus.CANCELLED
        db.commit()
        
        flash('予約をキャンセルしました。', 'success')
        return redirect(url_for('reservation_list'))
    except Exception as e:
        db.rollback()
        flash(f'キャンセル中にエラーが発生しました: {str(e)}', 'error')
    finally:
        db.close()
    
    return redirect(url_for('reservation_list'))

# ==================== 貸出関連 ====================

@app.route('/loans')
@login_required
def loan_list():
    """貸出一覧"""
    db = SessionLocal()
    try:
        if current_user.is_admin():
            loans = db.query(Loan).order_by(Loan.loan_date.desc()).all()
        else:
            loans = db.query(Loan).filter_by(
                user_id=current_user.id
            ).order_by(Loan.loan_date.desc()).all()
        
        # 延滞チェック
        for loan in loans:
            if loan.is_overdue() and loan.status == LoanStatus.ACTIVE:
                loan.status = LoanStatus.OVERDUE
                db.commit()
        
        return render_template('loans/list.html', loans=loans)
    finally:
        db.close()

@app.route('/reservations/<int:reservation_id>/loan', methods=['POST'])
@login_required
def create_loan(reservation_id):
    """予約から貸出を作成（管理者のみ）"""
    if not current_user.is_admin():
        flash('この操作は管理者のみ実行できます。', 'error')
        return redirect(url_for('reservation_list'))
    
    db = SessionLocal()
    try:
        reservation = db.query(Reservation).filter_by(id=reservation_id).first()
        if not reservation:
            flash('予約が見つかりません。', 'error')
            return redirect(url_for('reservation_list'))
        
        if reservation.status != ReservationStatus.PENDING:
            flash('この予約は貸出できません。', 'error')
            return redirect(url_for('reservation_list'))
        
        book = reservation.book
        if not book.is_available():
            flash('この書籍は現在利用できません。', 'error')
            return redirect(url_for('reservation_list'))
        
        # 貸出作成
        loan = Loan(
            user_id=reservation.user_id,
            book_id=reservation.book_id
        )
        db.add(loan)
        
        # 予約を確認済みに
        reservation.status = ReservationStatus.CONFIRMED
        
        # 在庫を減らす
        book.available_copies -= 1
        
        db.commit()
        
        flash('貸出手続きが完了しました。', 'success')
        return redirect(url_for('loan_list'))
    except Exception as e:
        db.rollback()
        flash(f'貸出手続き中にエラーが発生しました: {str(e)}', 'error')
    finally:
        db.close()
    
    return redirect(url_for('reservation_list'))

@app.route('/loans/<int:loan_id>/return', methods=['POST'])
@login_required
def return_loan(loan_id):
    """貸出を返却"""
    if not current_user.is_admin():
        flash('この操作は管理者のみ実行できます。', 'error')
        return redirect(url_for('loan_list'))
    
    db = SessionLocal()
    try:
        loan = db.query(Loan).filter_by(id=loan_id).first()
        if not loan:
            flash('貸出が見つかりません。', 'error')
            return redirect(url_for('loan_list'))
        
        if loan.status == LoanStatus.RETURNED:
            flash('この貸出は既に返却されています。', 'error')
            return redirect(url_for('loan_list'))
        
        # 返却処理
        loan.return_date = datetime.utcnow()
        loan.status = LoanStatus.RETURNED
        
        # 在庫を戻す
        book = loan.book
        book.available_copies += 1
        
        db.commit()
        
        flash('返却処理が完了しました。', 'success')
        return redirect(url_for('loan_list'))
    except Exception as e:
        db.rollback()
        flash(f'返却処理中にエラーが発生しました: {str(e)}', 'error')
    finally:
        db.close()
    
    return redirect(url_for('loan_list'))

# ==================== 管理画面 ====================

@app.route('/admin')
@login_required
def admin_dashboard():
    """管理画面ダッシュボード"""
    if not current_user.is_admin():
        flash('管理者権限が必要です。', 'error')
        return redirect(url_for('book_list'))
    
    db = SessionLocal()
    try:
        # 統計情報
        total_books = db.query(Book).count()
        total_users = db.query(User).count()
        total_reservations = db.query(Reservation).filter_by(status=ReservationStatus.PENDING).count()
        active_loans = db.query(Loan).filter_by(status=LoanStatus.ACTIVE).count()
        overdue_loans = db.query(Loan).filter_by(status=LoanStatus.OVERDUE).count()
        
        return render_template('admin/dashboard.html',
                             total_books=total_books,
                             total_users=total_users,
                             total_reservations=total_reservations,
                             active_loans=active_loans,
                             overdue_loans=overdue_loans)
    finally:
        db.close()

@app.route('/admin/books', methods=['GET', 'POST'])
@login_required
def admin_books():
    """書籍管理"""
    if not current_user.is_admin():
        flash('管理者権限が必要です。', 'error')
        return redirect(url_for('book_list'))
    
    db = SessionLocal()
    try:
        if request.method == 'POST':
            action = request.form.get('action')
            
            if action == 'add':
                # 書籍追加
                book = Book(
                    title=request.form.get('title'),
                    author=request.form.get('author'),
                    isbn=request.form.get('isbn') or None,
                    publisher=request.form.get('publisher') or None,
                    publication_date=datetime.strptime(request.form.get('publication_date'), '%Y-%m-%d').date() if request.form.get('publication_date') else None,
                    total_copies=int(request.form.get('total_copies', 1)),
                    available_copies=int(request.form.get('total_copies', 1))
                )
                db.add(book)
                db.commit()
                flash('書籍を追加しました。', 'success')
            
            elif action == 'edit':
                # 書籍編集
                book_id = int(request.form.get('book_id'))
                book = db.query(Book).filter_by(id=book_id).first()
                if book:
                    book.title = request.form.get('title')
                    book.author = request.form.get('author')
                    book.isbn = request.form.get('isbn') or None
                    book.publisher = request.form.get('publisher') or None
                    if request.form.get('publication_date'):
                        book.publication_date = datetime.strptime(request.form.get('publication_date'), '%Y-%m-%d').date()
                    # 総冊数の変更時、利用可能冊数も調整
                    new_total = int(request.form.get('total_copies', 1))
                    diff = new_total - book.total_copies
                    book.total_copies = new_total
                    book.available_copies = max(0, book.available_copies + diff)
                    db.commit()
                    flash('書籍を更新しました。', 'success')
            
            elif action == 'delete':
                # 書籍削除
                book_id = int(request.form.get('book_id'))
                book = db.query(Book).filter_by(id=book_id).first()
                if book:
                    db.delete(book)
                    db.commit()
                    flash('書籍を削除しました。', 'success')
        
        books = db.query(Book).order_by(Book.created_at.desc()).all()
        return render_template('admin/books.html', books=books)
    except Exception as e:
        db.rollback()
        flash(f'エラーが発生しました: {str(e)}', 'error')
    finally:
        db.close()
    
    return render_template('admin/books.html', books=[])

@app.route('/admin/users')
@login_required
def admin_users():
    """ユーザー管理"""
    if not current_user.is_admin():
        flash('管理者権限が必要です。', 'error')
        return redirect(url_for('book_list'))
    
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return render_template('admin/users.html', users=users)
    finally:
        db.close()

if __name__ == '__main__':
    # Docker環境では0.0.0.0でリッスン
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host=host, port=port)

