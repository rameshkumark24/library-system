package com.library.repository;

import com.library.model.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByMemberId(Long memberId);

    List<BorrowRecord> findByBookId(Long bookId);

    List<BorrowRecord> findByStatus(BorrowRecord.BorrowStatus status);

    List<BorrowRecord> findByMemberIdAndStatus(Long memberId, BorrowRecord.BorrowStatus status);

    boolean existsByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, BorrowRecord.BorrowStatus status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED' AND br.dueDate < :today")
    List<BorrowRecord> findOverdueRecords(LocalDate today);

    long countByStatus(BorrowRecord.BorrowStatus status);
}
