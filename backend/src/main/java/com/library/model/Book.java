package com.library.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Author is required")
    @Column(nullable = false)
    private String author;

    @Column(unique = true)
    private String isbn;

    private String genre;

    private Integer publishedYear;

    @NotNull(message = "Total copies is required")
    @Column(nullable = false)
    private Integer totalCopies = 1;

    @Column(nullable = false)
    private Integer availableCopies = 1;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status = BookStatus.AVAILABLE;

    public enum BookStatus {
        AVAILABLE, UNAVAILABLE
    }
}
