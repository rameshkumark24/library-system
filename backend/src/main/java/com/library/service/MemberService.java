package com.library.service;

import com.library.exception.ResourceNotFoundException;
import com.library.model.Member;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
    }

    public Member addMember(Member member) {
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new IllegalArgumentException("A member with email " + member.getEmail() + " already exists");
        }
        return memberRepository.save(member);
    }

    public Member updateMember(Long id, Member updatedMember) {
        Member existing = getMemberById(id);

        // Check email uniqueness if changed
        if (!updatedMember.getEmail().equals(existing.getEmail())
                && memberRepository.existsByEmail(updatedMember.getEmail())) {
            throw new IllegalArgumentException("Email already in use by another member");
        }

        existing.setName(updatedMember.getName());
        existing.setEmail(updatedMember.getEmail());
        existing.setPhone(updatedMember.getPhone());
        existing.setAddress(updatedMember.getAddress());
        existing.setStatus(updatedMember.getStatus());
        existing.setMembershipExpiry(updatedMember.getMembershipExpiry());

        return memberRepository.save(existing);
    }

    public void deleteMember(Long id) {
        Member member = getMemberById(id);
        memberRepository.delete(member);
    }

    public List<Member> searchMembers(String keyword) {
        return memberRepository.searchMembers(keyword);
    }
}
