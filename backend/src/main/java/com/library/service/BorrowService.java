package com.library.service;

import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.Member;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public BorrowRecord borrowBook(Long bookId, Long memberId, int borrowDays) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("No copies available for: " + book.getTitle());
        }
        if (member.getStatus() != Member.MemberStatus.ACTIVE) {
            throw new IllegalArgumentException("Member account is not active");
        }
        if (borrowRecordRepository.existsByBookIdAndMemberIdAndStatus(
                bookId, memberId, BorrowRecord.BorrowStatus.BORROWED)) {
            throw new IllegalArgumentException("Member already has this book borrowed");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus(Book.BookStatus.UNAVAILABLE);
        }
        bookRepository.save(book);

        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setMember(member);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(borrowDays > 0 ? borrowDays : 14));
        record.setStatus(BorrowRecord.BorrowStatus.BORROWED);

        return borrowRecordRepository.save(record);
    }

    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record", recordId));

        if (record.getStatus() == BorrowRecord.BorrowStatus.RETURNED) {
            throw new IllegalArgumentException("This book has already been returned");
        }

        record.setReturnDate(LocalDate.now());
        record.setStatus(BorrowRecord.BorrowStatus.RETURNED);

        // Increment available copies
        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus(Book.BookStatus.AVAILABLE);
        bookRepository.save(book);

        return borrowRecordRepository.save(record);
    }

    public List<BorrowRecord> getAllBorrows() {
        return borrowRecordRepository.findAll();
    }

    public List<BorrowRecord> getBorrowsByMember(Long memberId) {
        return borrowRecordRepository.findByMemberId(memberId);
    }

    public List<BorrowRecord> getBorrowsByStatus(BorrowRecord.BorrowStatus status) {
        return borrowRecordRepository.findByStatus(status);
    }

    public List<BorrowRecord> getOverdueRecords() {
        return borrowRecordRepository.findOverdueRecords(LocalDate.now());
    }

    // Update overdue status every hour
    @Scheduled(fixedRate = 3600000)
    public void markOverdueRecords() {
        List<BorrowRecord> overdue = borrowRecordRepository.findOverdueRecords(LocalDate.now());
        for (BorrowRecord record : overdue) {
            record.setStatus(BorrowRecord.BorrowStatus.OVERDUE);
        }
        borrowRecordRepository.saveAll(overdue);
    }
}
