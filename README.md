
# Smart Expense Tracker

A web application for managing personal expenses.

## Technologies

- Python and Flask
- SQLite and SQLAlchemy
- HTML, CSS, and JavaScript
- Chart.js
- JWT authentication

## Features

- User registration and login
- Add, view, edit, and delete expenses
- Track spending by category
- Monthly expense summaries
- Expense charts
- Budget alerts
- Export expenses to CSV

## Run Locally

1. Install Python.
2. Create a virtual environment.
3. Install dependencies:

   `pip install -r requirements.txt`

4. Configure the `JWT_SECRET_KEY` environment variable.
5. Start the Flask application:

   `python app.py`

6. Open `http://127.0.0.1:5000/dashboard`.

## Security

The SQLite database, virtual environment, and secret configuration files are excluded from Git.

## Project Status

Core features implemented locally. Deployment and final verification are in progress.
