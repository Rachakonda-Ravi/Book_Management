from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Book
from ..schemas import BookCreate, BookUpdate, BookResponse, BookListResponse, UserStats
from ..auth import get_current_user_id
import csv
from io import StringIO

router = APIRouter()

@router.get("/", response_model=BookListResponse)
def get_books(
    db: Session = Depends(get_db),
    sort_by: str = Query("author", description="Field to sort by"),
    order: str = Query("asc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str = Query("", description="Search by name, author, publisher"),
    author: str = Query("", description="Filter by author"),
    publisher: str = Query("", description="Filter by publisher"),
    stock_status: str = Query("", description="Filter by stock status"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_date: str = Query("", description="Minimum publish date (YYYY-MM-DD)"),
    max_date: str = Query("", description="Maximum publish date (YYYY-MM-DD)")
):
    """Get paginated, filtered, and sorted books"""
    try:
        query = db.query(Book)
        
        # Full-text search
        if search.strip():
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (Book.name.ilike(search_term)) |
                (Book.author.ilike(search_term)) |
                (Book.publisher.ilike(search_term))
            )
        
        # Filters
        if author.strip():
            query = query.filter(Book.author.ilike(f"%{author.strip()}%"))
        if publisher.strip():
            query = query.filter(Book.publisher.ilike(f"%{publisher.strip()}%"))
        if stock_status.strip():
            query = query.filter(Book.stock_status == stock_status.strip())
        if min_price is not None:
            query = query.filter(Book.Cost >= min_price)
        if max_price is not None:
            query = query.filter(Book.Cost <= max_price)
        if min_date.strip():
            query = query.filter(Book.date >= min_date.strip())
        if max_date.strip():
            query = query.filter(Book.date <= max_date.strip())
        
        # Get total count before pagination
        total = query.count()
        total_pages = (total + page_size - 1) // page_size
        
        # Validate sort_by parameter
        valid_fields = ["id", "name", "author", "publisher", "date", "Cost", "created_at"]
        if sort_by not in valid_fields:
            sort_by = "author"
        
        # Apply sorting
        sort_column = getattr(Book, sort_by)
        if order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination with offset() instead of skip()
        skip = (page - 1) * page_size
        books = query.offset(skip).limit(page_size).all()
        
        return BookListResponse(
            books=books,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching books: {str(e)}")

@router.get("/search", response_model=List[BookResponse])
def search_books(
    db: Session = Depends(get_db),
    q: str = Query("", description="Search term")
):
    """Quick search across book name, author, and publisher"""
    if not q.strip():
        return []
    
    search_term = f"%{q.strip()}%"
    books = db.query(Book).filter(
        (Book.name.ilike(search_term)) |
        (Book.author.ilike(search_term)) |
        (Book.publisher.ilike(search_term))
    ).limit(20).all()
    
    return books

@router.post("/create", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    db_book = Book(
        user_id=current_user_id,
        publisher=book_in.publisher,
        name=book_in.name,
        author=book_in.author,
        date=book_in.date,
        Cost=book_in.Cost,
        cover_url=book_in.cover_url,
        stock_status=book_in.stock_status or "available"
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.post("/bulk-import")
def bulk_import_books(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
    csv_data: str = Query(...)
):
    """Import books from CSV data. Format: name,author,publisher,date,cost,cover_url,stock_status"""
    try:
        reader = csv.DictReader(StringIO(csv_data))
        books_created = 0
        errors = []
        
        for idx, row in enumerate(reader, start=2):
            try:
                book = Book(
                    user_id=current_user_id,
                    name=row.get('name', '').strip(),
                    author=row.get('author', '').strip(),
                    publisher=row.get('publisher', '').strip(),
                    date=row.get('date', '').strip(),
                    Cost=float(row.get('cost', 0)),
                    cover_url=row.get('cover_url', '').strip() or None,
                    stock_status=row.get('stock_status', 'available').strip()
                )
                
                # Validate required fields
                if not all([book.name, book.author, book.publisher, book.date]):
                    errors.append(f"Row {idx}: Missing required fields")
                    continue
                
                db.add(book)
                books_created += 1
            except Exception as e:
                errors.append(f"Row {idx}: {str(e)}")
        
        db.commit()
        return {
            "success": True,
            "books_created": books_created,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")

@router.put("/update/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_in: BookUpdate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    db_book = db.query(Book).filter(
        (Book.id == book_id) & (Book.user_id == current_user_id)
    ).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db_book.publisher = book_in.publisher
    db_book.name = book_in.name
    db_book.author = book_in.author
    db_book.date = book_in.date
    db_book.Cost = book_in.Cost
    db_book.cover_url = book_in.cover_url
    db_book.stock_status = book_in.stock_status
    
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/delete/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    db_book = db.query(Book).filter(
        (Book.id == book_id) & (Book.user_id == current_user_id)
    ).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(db_book)
    db.commit()
    return {"result": "Book deleted"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """Get user statistics"""
    books = db.query(Book).filter(Book.user_id == current_user_id).all()
    
    total_books = len(books)
    total_cost = sum(book.Cost for book in books) if books else 0.0
    most_expensive = max(books, key=lambda x: x.Cost) if books else None
    average_rating = 4.5  # Placeholder - can be expanded with ratings table
    
    return {
        "total_books": total_books,
        "total_cost": total_cost,
        "most_expensive": most_expensive,
        "average_rating": average_rating,
        "username": "User"
    }

@router.get("/export")
def export_books(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """Export all books as CSV"""
    books = db.query(Book).filter(Book.user_id == current_user_id).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['name', 'author', 'publisher', 'date', 'cost', 'cover_url', 'stock_status'])
    
    for book in books:
        writer.writerow([
            book.name,
            book.author,
            book.publisher,
            book.date,
            book.Cost,
            book.cover_url or '',
            book.stock_status
        ])
    
    return {
        "csv": output.getvalue(),
        "filename": "books_export.csv"
    }
