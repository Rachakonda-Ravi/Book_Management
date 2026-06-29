#!/usr/bin/env python
"""Database initialization script"""

from app.database import engine, Base
from app.models import User, Book  # MUST import models to register them with Base

# Create all tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("[OK] Tables created successfully!")

# Verify
import sqlite3
conn = sqlite3.connect('books.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print(f"\nTables in database: {[t[0] for t in tables]}")
conn.close()
