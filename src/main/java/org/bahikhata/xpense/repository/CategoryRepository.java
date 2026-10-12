package org.bahikhata.xpense.repository;

import org.bahikhata.xpense.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("""
            SELECT c FROM Category c
            JOIN FETCH c.user
            WHERE c.user.userId IN (:userId, :systemUserId)
            ORDER BY c.categoryName
            """)
    List<Category> findVisibleCategories(
            @Param("userId") Long userId,
            @Param("systemUserId") Long systemUserId
    );

    Optional<Category> findByUser_UserIdAndCategoryNameIgnoreCase(Long userId, String categoryName);

    @Query("""
            SELECT c FROM Category c
            JOIN FETCH c.user
            WHERE c.categoryId = :categoryId
              AND c.user.userId IN (:userId, :systemUserId)
            """)
    Optional<Category> findVisibleCategory(
            @Param("categoryId") Long categoryId,
            @Param("userId") Long userId,
            @Param("systemUserId") Long systemUserId
    );

    boolean existsByUser_UserIdAndCategoryNameIgnoreCase(Long userId, String categoryName);
}
