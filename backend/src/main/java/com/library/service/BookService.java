package com.library.service;

import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    public Book addBook(Book book) {
        if (book.getIsbn() != null && !book.getIsbn().isBlank()) {
            bookRepository.findByIsbn(book.getIsbn()).ifPresent(b -> {
                throw new IllegalArgumentException("A book with ISBN " + book.getIsbn() + " already exists");
            });
        }
        book.setAvailableCopies(book.getTotalCopies());
        book.setStatus(book.getTotalCopies() > 0 ? Book.BookStatus.AVAILABLE : Book.BookStatus.UNAVAILABLE);
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book updatedBook) {
        Book existing = getBookById(id);

        // If ISBN changed, check uniqueness
        if (updatedBook.getIsbn() != null && !updatedBook.getIsbn().equals(existing.getIsbn())) {
            bookRepository.findByIsbn(updatedBook.getIsbn()).ifPresent(b -> {
                if (!b.getId().equals(id)) {
                    throw new IllegalArgumentException("ISBN already in use by another book");
                }
            });
        }

        int borrowedCopies = existing.getTotalCopies() - existing.getAvailableCopies();
        existing.setTitle(updatedBook.getTitle());
        existing.setAuthor(updatedBook.getAuthor());
        existing.setIsbn(updatedBook.getIsbn());
        existing.setGenre(updatedBook.getGenre());
        existing.setPublishedYear(updatedBook.getPublishedYear());
        existing.setDescription(updatedBook.getDescription());
        existing.setTotalCopies(updatedBook.getTotalCopies());
        int newAvailable = Math.max(0, updatedBook.getTotalCopies() - borrowedCopies);
        existing.setAvailableCopies(newAvailable);
        existing.setStatus(newAvailable > 0 ? Book.BookStatus.AVAILABLE : Book.BookStatus.UNAVAILABLE);

        return bookRepository.save(existing);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.searchBooks(keyword);
    }
}
