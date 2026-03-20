package com.library.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "borrow_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate borrowDate = LocalDate.now();

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status = BorrowStatus.BORROWED;

    // Fine calculation: 5 per day after due date
    public double calculateFine() {
        if (status == BorrowStatus.RETURNED || returnDate == null) {
            LocalDate checkDate = LocalDate.now();
            if (checkDate.isAfter(dueDate)) {
                return dueDate.until(checkDate).getDays() * 5.0;
            }
            return 0;
        }
        if (returnDate.isAfter(dueDate)) {
            return dueDate.until(returnDate).getDays() * 5.0;
        }
        return 0;
    }

    public enum BorrowStatus {
        BORROWED, RETURNED, OVERDUE
    }
}
