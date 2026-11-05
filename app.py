
from flask import Flask, request, jsonify, send_from_directory, g
from flask_sqlalchemy import SQLAlchemy
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets
from datetime import date
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
@app.route("/dashboard")
def dashboard():
    return send_from_directory("frontend", "index.html")


@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory("frontend", filename)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///expenses.db")
db = SQLAlchemy(app)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    date = db.Column(db.Date, nullable=True)
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)


def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Login required"}), 401

        token = auth_header[7:]
        secret_key = app.config.get("JWT_SECRET_KEY")

        if not secret_key:
            return jsonify({"error": "Authentication is not configured"}), 503

        try:
            payload = jwt.decode(
                token,
                secret_key,
                algorithms=["HS256"]
            )
            user_id = payload.get("user_id")
            user = db.session.get(User, user_id)


            if user is None:
                return jsonify({"error": "Invalid user"}), 401

            g.user_id = user.id

        except (jwt.InvalidTokenError, TypeError, ValueError):
            return jsonify({"error": "Invalid or expired token"}), 401


        return func(*args, **kwargs)

    return wrapper



@app.route("/api/expenses", methods=["GET"])
@token_required
def get_expenses():
           
    expenses = db.session.execute(
        db.select(Expense).filter_by(user_id=g.user_id)
    ).scalars().all()

    result = []

    for expense in expenses:
        result.append({
            "id": expense.id,
            "category": expense.category,
            "amount": expense.amount,
            "description": expense.description,
            "date": expense.date.isoformat() if expense.date else None
        })

    return jsonify(result)

    
@app.route("/api/expenses", methods=["POST"])
@token_required
def add_expense():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please provide JSON data"}), 400

    category = data.get("category")
    amount = data.get("amount")
    description = data.get("description", "")

    if not isinstance(category, str) or not category.strip():
        return jsonify({"error": "Category is required"}), 400

    if type(amount) not in (int, float) or not (0 < amount < float("inf")):
        return jsonify({"error": "Amount must be a positive number"}), 400

    if not isinstance(description, str):
        return jsonify({"error": "Description must be text"}), 400

    new_expense = Expense(
    user_id=g.user_id,    
    category=category.strip(),
    amount=amount,
    description=description,
    date=date.today()
)
    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "message": "Expense added successfully",
        "id": new_expense.id
    }), 201

@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
@token_required
def update_expense(expense_id):
    
    expense = db.session.execute(
        db.select(Expense).filter_by(
            id=expense_id,
            user_id=g.user_id
        )
    ).scalar_one_or_none()


    if expense is None:
        return jsonify({"error": "Expense not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please provide JSON data"}), 400

    if "category" in data:
        category = data["category"]
        if not isinstance(category, str) or not category.strip():
            return jsonify({"error": "Invalid category"}), 400
        expense.category = category.strip()

    if "amount" in data:
        amount = data["amount"]
        if type(amount) not in (int, float) or not (0 < amount < float("inf")):
            return jsonify({"error": "Amount must be a positive number"}), 400
        expense.amount = amount

    if "description" in data:
        description = data["description"]
        if not isinstance(description, str):
            return jsonify({"error": "Description must be text"}), 400
        expense.description = description

    db.session.commit()

    return jsonify({"message": "Expense updated successfully"})

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
@token_required
def delete_expense(expense_id):
    
    expense = db.session.execute(
        db.select(Expense).filter_by(
            id=expense_id,
            user_id=g.user_id
        )
    ).scalar_one_or_none()


    if expense is None:
        return jsonify({"error": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted successfully"})

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please provide JSON data"}), 400

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or len(username.strip()) < 3:
        return jsonify({"error": "Username must have at least 3 characters"}), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Password must have at least 8 characters"}), 400

    username = username.strip()

    existing_user = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify({"error": "Username already exists"}), 409

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request"}), 400

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid credentials"}), 401

    user = db.session.execute(
        db.select(User).filter_by(username=username)
    ).scalar_one_or_none()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    secret_key = app.config.get("JWT_SECRET_KEY")

    if not secret_key:
        return jsonify({"error": "Authentication is not configured"}), 503

    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
        },
        secret_key,
        algorithm="HS256"
    )

    return jsonify({"token": token}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
