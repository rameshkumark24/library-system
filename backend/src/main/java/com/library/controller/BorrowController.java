package com.library.controller;

import com.library.model.BorrowRecord;
import com.library.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> getAllBorrows(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long memberId) {

        if (memberId != null) {
            return ResponseEntity.ok(borrowService.getBorrowsByMember(memberId));
        }
        if (status != null) {
            BorrowRecord.BorrowStatus borrowStatus = BorrowRecord.BorrowStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(borrowService.getBorrowsByStatus(borrowStatus));
        }
        return ResponseEntity.ok(borrowService.getAllBorrows());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<BorrowRecord>> getOverdueRecords() {
        return ResponseEntity.ok(borrowService.getOverdueRecords());
    }

    @PostMapping("/issue")
    public ResponseEntity<BorrowRecord> borrowBook(@RequestBody Map<String, Object> request) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        Long memberId = Long.valueOf(request.get("memberId").toString());
        int days = request.containsKey("days") ? Integer.parseInt(request.get("days").toString()) : 14;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(borrowService.borrowBook(bookId, memberId, days));
    }

    @PutMapping("/return/{recordId}")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long recordId) {
        return ResponseEntity.ok(borrowService.returnBook(recordId));
    }
}
