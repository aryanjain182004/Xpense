package org.bahikhata.xpense.service;

import org.bahikhata.xpense.dto.CategoryRequest;
import org.bahikhata.xpense.dto.CategoryResponse;
import org.bahikhata.xpense.entity.Category;
import org.bahikhata.xpense.entity.User;
import org.bahikhata.xpense.exception.ConflictException;
import org.bahikhata.xpense.exception.ResourceNotFoundException;
import org.bahikhata.xpense.exception.UnauthorizedException;
import org.bahikhata.xpense.repository.CategoryRepository;
import org.bahikhata.xpense.repository.TransactionRepository;
import org.bahikhata.xpense.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);
    private static final Long SYSTEM_USER_ID = 1L;
    private static final String FALLBACK_CATEGORY_NAME = "Other";

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private JwtService jwtService;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findVisibleCategories(jwtService.getCurrentUserId(), SYSTEM_USER_ID)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Long userId = jwtService.getCurrentUserId();
        String name = request.categoryName().trim();

        if (isDefaultCategoryName(name)) {
            throw new ConflictException("Category already exists: " + name);
        }

        if (categoryRepository.findByUser_UserIdAndCategoryNameIgnoreCase(userId, name).isPresent()) {
            throw new ConflictException("Category already exists: " + name);
        }

        Category category = new Category();
        category.setCategoryName(name);
        User user = new User();
        user.setUserId(userId);
        category.setUser(user);
        Category saved = categoryRepository.save(category);
        log.info("Created category id={} for userId={}", saved.getCategoryId(), userId);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long categoryId, CategoryRequest request) {
        Long userId = jwtService.getCurrentUserId();
        Category category = findById(categoryId);
        isOwner(category, userId);
        String name = request.categoryName().trim();

        if (isDefaultCategoryName(name)) {
            throw new ConflictException("Category already exists: " + name);
        }

        categoryRepository.findByUser_UserIdAndCategoryNameIgnoreCase(userId, name)
                .filter(other -> !other.getCategoryId().equals(categoryId))
                .ifPresent(other -> {
                    throw new ConflictException("Category already exists: " + name);
                });
        category.setCategoryName(name);
        log.info("Updated category id={} for userId={}", categoryId, userId);
        return toResponse(category);
    }

    @Transactional
    public void delete(Long categoryId) {
        Long userId = jwtService.getCurrentUserId();
        Category category = findById(categoryId);
        isOwner(category, userId);
        Category fallback = fallbackCategory();
        int moved = transactionRepository.reassignTransactions(
                userId,
                categoryId,
                fallback,
                Instant.now()
        );
        categoryRepository.delete(category);
        log.info(
                "Deleted category id={}; moved {} transaction(s) to {} id={}",
                categoryId,
                moved,
                fallback.getCategoryName(),
                fallback.getCategoryId()
        );
    }

    private Category fallbackCategory() {
        return categoryRepository.findByUser_UserIdAndCategoryNameIgnoreCase(SYSTEM_USER_ID, FALLBACK_CATEGORY_NAME)
                .orElseThrow(() -> new ResourceNotFoundException("Fallback category not found: " + FALLBACK_CATEGORY_NAME));
    }

    @Transactional(readOnly = true)
    public Category findById(Long categoryId) {
        return categoryRepository.findVisibleCategory(
                        categoryId,
                        jwtService.getCurrentUserId(),
                        SYSTEM_USER_ID
                )
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
    }

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getCategoryId(),
                category.getCategoryName(),
                SYSTEM_USER_ID.equals(category.getUser().getUserId())
        );
    }

    private void isOwner(Category category, Long userId) {
        if (!userId.equals(category.getUser().getUserId())) {
            log.warn("User {} tried to change default/other category {}", userId, category.getCategoryId());
            throw new UnauthorizedException("Cannot change a default category");
        }
    }

    private boolean isDefaultCategoryName(String name) {
        return categoryRepository.existsByUser_UserIdAndCategoryNameIgnoreCase(SYSTEM_USER_ID, name);
    }
}
