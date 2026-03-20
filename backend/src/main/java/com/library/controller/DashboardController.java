package com.library.controller;

import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.MemberRepository;
import com.library.model.BorrowRecord;
import com.library.model.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalBooks = bookRepository.count();
        long availableBooks = bookRepository.countByAvailableCopiesGreaterThan(0);
        long totalMembers = memberRepository.count();
        long activeMembers = memberRepository.countByStatus(Member.MemberStatus.ACTIVE);
        long totalBorrows = borrowRecordRepository.count();
        long activeBorrows = borrowRecordRepository.countByStatus(BorrowRecord.BorrowStatus.BORROWED);
        long overdueBorrows = borrowRecordRepository.findOverdueRecords(LocalDate.now()).size();
        long returnedBorrows = borrowRecordRepository.countByStatus(BorrowRecord.BorrowStatus.RETURNED);

        stats.put("totalBooks", totalBooks);
        stats.put("availableBooks", availableBooks);
        stats.put("totalMembers", totalMembers);
        stats.put("activeMembers", activeMembers);
        stats.put("totalBorrows", totalBorrows);
        stats.put("activeBorrows", activeBorrows);
        stats.put("overdueBorrows", overdueBorrows);
        stats.put("returnedBorrows", returnedBorrows);

        return ResponseEntity.ok(stats);
    }
}
