package com.library.repository;

import com.library.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT m FROM Member m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "m.phone LIKE CONCAT('%', :keyword, '%')")
    List<Member> searchMembers(@Param("keyword") String keyword);

    long countByStatus(Member.MemberStatus status);
}
