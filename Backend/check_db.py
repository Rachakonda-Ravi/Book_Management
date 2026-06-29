import sqlite3
import sys

try:
    conn = sqlite3.connect('books.db')
    cursor = conn.cursor()
    
    # Get tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print('Database Tables:')
    for table in tables:
        print(f'  - {table[0]}')
        
    # Count books
    cursor.execute('SELECT COUNT(*) FROM book')
    book_count = cursor.fetchone()[0]
    print(f'\nTotal books in DB: {book_count}')
    
    # Get book details
    if book_count > 0:
        cursor.execute('SELECT id, user_id, name, author FROM book LIMIT 5')
        books = cursor.fetchall()
        print(f'\nSample books:')
        for book in books:
            print(f'  ID:{book[0]}, User:{book[1]}, Name:{book[2]}, Author:{book[3]}')
    
    # Check users
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    print(f'\nTotal users: {user_count}')
    
    if user_count > 0:
        cursor.execute('SELECT id, username FROM users LIMIT 5')
        users = cursor.fetchall()
        print(f'\nUsers:')
        for user in users:
            print(f'  ID:{user[0]}, Username:{user[1]}')
    
    conn.close()
    print('\n✅ Database is healthy')
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
