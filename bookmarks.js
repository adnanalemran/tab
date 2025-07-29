// Bookmarks functionality with localStorage
class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.init();
    }

    init() {
        this.renderBookmarks();
    }

    loadBookmarks() {
        const stored = localStorage.getItem('newTabBookmarks');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return default bookmarks for first-time users
        return [
            {
                id: 1,
                name: 'GitHub',
                url: 'https://github.com',
                icon: '🐙',
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                icon: '📚',
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                name: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                icon: '📖',
                dateAdded: new Date().toISOString()
            },
            {
                id: 4,
                name: 'CodePen',
                url: 'https://codepen.io',
                icon: '✏️',
                dateAdded: new Date().toISOString()
            }
        ];
    }

    saveBookmarks() {
        localStorage.setItem('newTabBookmarks', JSON.stringify(this.bookmarks));
    }

    addBookmark(name, url, icon = '🔖') {
        // Validate inputs
        if (!name.trim()) {
            this.showNotification('Please enter a bookmark name', 'error');
            return false;
        }
        
        if (!url.trim()) {
            this.showNotification('Please enter a valid URL', 'error');
            return false;
        }

        // Check for duplicate names
        if (this.bookmarks.some(b => b.name.toLowerCase() === name.trim().toLowerCase())) {
            this.showNotification('A bookmark with this name already exists', 'error');
            return false;
        }

        const bookmark = {
            id: Date.now(),
            name: name.trim(),
            url: url.trim(),
            icon: icon.trim() || '🔖',
            dateAdded: new Date().toISOString()
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
        this.showNotification(`"${bookmark.name}" added successfully!`, 'success');
        return true;
    }

    removeBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        // Enhanced confirmation dialog
        const confirmMessage = `Are you sure you want to delete "${bookmark.name}"?\n\nThis action cannot be undone.`;
        if (confirm(confirmMessage)) {
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
            this.saveBookmarks();
            this.renderBookmarks();
            
            // Show success message with undo option (for future enhancement)
            this.showNotification(`"${bookmark.name}" deleted successfully`, 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.bookmark-notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `bookmark-notification ${type}`;
        
        // Add icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span style="margin-right: 8px;">${icons[type] || icons.info}</span>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Trigger entrance animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, type === 'error' ? 4000 : 3000); // Show errors longer
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksContainer');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; color: #8e8e93;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">📚</div>
                    <div style="font-weight: 500; margin-bottom: 0.5rem;">No bookmarks yet</div>
                    <div style="font-size: 0.9rem; opacity: 0.7;">Click the + button to add your first bookmark</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.bookmarks.map((bookmark, index) => `
            <div class="bookmark-item" 
                 data-bookmark-id="${bookmark.id}"
                 data-color-index="${index % 4}"
                 draggable="true"
                 title="${bookmark.name} - ${bookmark.url}">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                <a href="${this.formatUrl(bookmark.url)}" class="bookmark-link" target="_blank" rel="noopener noreferrer">
                    <span class="bookmark-icon">${bookmark.icon}</span>
                    <span class="bookmark-name">${this.truncateText(bookmark.name, 20)}</span>
                </a>
                <button class="bookmark-edit" 
                        data-bookmark-id="${bookmark.id}"
                        title="Edit ${bookmark.name}"
                        aria-label="Edit bookmark">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="bookmark-delete" 
                        data-bookmark-id="${bookmark.id}"
                        title="Delete ${bookmark.name}"
                        aria-label="Delete bookmark">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6L18 18"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add staggered animation for new items
        const items = container.querySelectorAll('.bookmark-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        // Add event listeners for delete buttons and drag & drop
        this.attachDeleteListeners();
        this.attachEditListeners();
        this.attachDragAndDropListeners();
        this.attachTouchListeners();
    }

    // Helper method to format URLs
    formatUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    // Helper method to truncate text
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 1) + '…';
    }

    attachDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.bookmark-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(button.dataset.bookmarkId);
                this.removeBookmark(id);
            });
        });
    }

    attachEditListeners() {
        const editButtons = document.querySelectorAll('.bookmark-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(button.dataset.bookmarkId);
                this.editBookmark(id);
            });
        });
    }

    editBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        // Populate the edit modal with current values
        document.getElementById('editBookmarkId').value = bookmark.id;
        document.getElementById('editBookmarkName').value = bookmark.name;
        document.getElementById('editBookmarkUrl').value = bookmark.url;
        document.getElementById('editBookmarkIcon').value = bookmark.icon;
        
        // Show edit modal
        document.getElementById('editBookmarkModal').style.display = 'flex';
        document.getElementById('editBookmarkName').focus();
        document.getElementById('editBookmarkName').select();
    }

    updateBookmark(id, name, url, icon) {
        const bookmarkIndex = this.bookmarks.findIndex(b => b.id === id);
        if (bookmarkIndex === -1) {
            this.showNotification('Bookmark not found', 'error');
            return false;
        }
        
        // Validate inputs
        if (!name.trim()) {
            this.showNotification('Please enter a bookmark name', 'error');
            return false;
        }
        
        if (!url.trim()) {
            this.showNotification('Please enter a valid URL', 'error');
            return false;
        }

        // Check for duplicate names (excluding current bookmark)
        if (this.bookmarks.some(b => b.id !== id && b.name.toLowerCase() === name.trim().toLowerCase())) {
            this.showNotification('A bookmark with this name already exists', 'error');
            return false;
        }
        
        const oldName = this.bookmarks[bookmarkIndex].name;
        this.bookmarks[bookmarkIndex] = {
            ...this.bookmarks[bookmarkIndex],
            name: name.trim(),
            url: url.trim(),
            icon: icon.trim() || '🔖',
            dateModified: new Date().toISOString()
        };
        
        this.saveBookmarks();
        this.renderBookmarks();
        this.showNotification(`"${oldName}" updated successfully!`, 'success');
        return true;
    }

    attachDragAndDropListeners() {
        const bookmarkItems = document.querySelectorAll('.bookmark-item');
        
        bookmarkItems.forEach(item => {
            // Prevent dragging when clicking on link, edit button, or delete button
            const link = item.querySelector('.bookmark-link');
            const deleteBtn = item.querySelector('.bookmark-delete');
            const editBtn = item.querySelector('.bookmark-edit');
            
            if (link) {
                link.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                link.addEventListener('mousedown', (e) => {
                    item.draggable = false;
                });
                
                link.addEventListener('mouseup', (e) => {
                    item.draggable = true;
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                deleteBtn.addEventListener('mousedown', (e) => {
                    item.draggable = false;
                });
                
                deleteBtn.addEventListener('mouseup', (e) => {
                    item.draggable = true;
                });
            }

            if (editBtn) {
                editBtn.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                editBtn.addEventListener('mousedown', (e) => {
                    item.draggable = false;
                });
                
                editBtn.addEventListener('mouseup', (e) => {
                    item.draggable = true;
                });
            }

            // Drag start event
            item.addEventListener('dragstart', (e) => {
                // Only allow drag if not clicking on link, edit button, or delete button
                if (e.target.closest('.bookmark-link') || 
                    e.target.closest('.bookmark-delete') || 
                    e.target.closest('.bookmark-edit')) {
                    e.preventDefault();
                    return false;
                }
                
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                e.dataTransfer.setData('text/plain', item.dataset.bookmarkId);
                
                // Prevent accidental clicks during drag
                const itemLink = item.querySelector('.bookmark-link');
                if (itemLink) {
                    itemLink.style.pointerEvents = 'none';
                }
            });

            // Drag end event
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                
                // Re-enable link click
                const itemLink = item.querySelector('.bookmark-link');
                if (itemLink) {
                    itemLink.style.pointerEvents = 'auto';
                }
                
                // Remove drag-over class from all items
                document.querySelectorAll('.bookmark-item').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });

            // Drag over event
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem && draggingItem !== item) {
                    item.classList.add('drag-over');
                }
            });

            // Drag leave event
            item.addEventListener('dragleave', (e) => {
                // Only remove if leaving the item completely
                if (!item.contains(e.relatedTarget)) {
                    item.classList.remove('drag-over');
                }
            });

            // Drop event
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                const targetId = parseInt(item.dataset.bookmarkId);
                
                if (draggedId !== targetId) {
                    this.reorderBookmarks(draggedId, targetId);
                }
            });
        });
    }

    reorderBookmarks(draggedId, targetId) {
        const draggedIndex = this.bookmarks.findIndex(b => b.id === draggedId);
        const targetIndex = this.bookmarks.findIndex(b => b.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // Remove the dragged bookmark from its current position
        const [draggedBookmark] = this.bookmarks.splice(draggedIndex, 1);
        
        // Insert it at the target position
        this.bookmarks.splice(targetIndex, 0, draggedBookmark);
        
        // Save and re-render
        this.saveBookmarks();
        this.renderBookmarks();
        
        // Show success message
        this.showNotification('Bookmark reordered successfully!', 'success');
    }

    // Touch event handlers for mobile drag and drop
    attachTouchListeners() {
        const bookmarkItems = document.querySelectorAll('.bookmark-item');
        let touchItem = null;
        let touchStartPos = { x: 0, y: 0 };
        let isDragging = false;

        bookmarkItems.forEach(item => {
            item.addEventListener('touchstart', (e) => {
                // Only start drag if touching the drag handle or item itself (not link, edit, or delete)
                if (e.target.closest('.bookmark-link') || 
                    e.target.closest('.bookmark-delete') || 
                    e.target.closest('.bookmark-edit')) {
                    return;
                }
                
                touchItem = item;
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
                
                setTimeout(() => {
                    if (touchItem && !isDragging) {
                        isDragging = true;
                        item.classList.add('dragging');
                        // Prevent scrolling while dragging
                        document.body.style.touchAction = 'none';
                    }
                }, 150); // Small delay to distinguish from scrolling
            });

            item.addEventListener('touchmove', (e) => {
                if (!isDragging || !touchItem) return;
                
                e.preventDefault();
                const touch = e.touches[0];
                
                // Move the element with finger
                touchItem.style.position = 'fixed';
                touchItem.style.left = `${touch.clientX - 50}px`;
                touchItem.style.top = `${touch.clientY - 20}px`;
                touchItem.style.zIndex = '1000';
                
                // Find element under touch point
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropTarget = elementBelow?.closest('.bookmark-item');
                
                // Remove drag-over from all items
                document.querySelectorAll('.bookmark-item').forEach(el => {
                    el.classList.remove('drag-over');
                });
                
                // Add drag-over to current target
                if (dropTarget && dropTarget !== touchItem) {
                    dropTarget.classList.add('drag-over');
                }
            });

            item.addEventListener('touchend', (e) => {
                if (!isDragging || !touchItem) {
                    touchItem = null;
                    return;
                }
                
                const touch = e.changedTouches[0];
                const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropTarget = elementBelow?.closest('.bookmark-item');
                
                // Reset styles
                touchItem.style.position = '';
                touchItem.style.left = '';
                touchItem.style.top = '';
                touchItem.style.zIndex = '';
                touchItem.classList.remove('dragging');
                document.body.style.touchAction = '';
                
                // Remove drag-over from all items
                document.querySelectorAll('.bookmark-item').forEach(el => {
                    el.classList.remove('drag-over');
                });
                
                // Handle drop
                if (dropTarget && dropTarget !== touchItem) {
                    const draggedId = parseInt(touchItem.dataset.bookmarkId);
                    const targetId = parseInt(dropTarget.dataset.bookmarkId);
                    this.reorderBookmarks(draggedId, targetId);
                }
                
                touchItem = null;
                isDragging = false;
            });
        });
    }
}

// Modal functions
function showAddBookmarkModal() {
    document.getElementById('bookmarkModal').style.display = 'flex';
    document.getElementById('bookmarkName').focus();
}

function hideAddBookmarkModal() {
    document.getElementById('bookmarkModal').style.display = 'none';
    document.getElementById('bookmarkName').value = '';
    document.getElementById('bookmarkUrl').value = '';
    document.getElementById('bookmarkIcon').value = '';
}

function showEditBookmarkModal() {
    document.getElementById('editBookmarkModal').style.display = 'flex';
}

function hideEditBookmarkModal() {
    document.getElementById('editBookmarkModal').style.display = 'none';
    document.getElementById('editBookmarkId').value = '';
    document.getElementById('editBookmarkName').value = '';
    document.getElementById('editBookmarkUrl').value = '';
    document.getElementById('editBookmarkIcon').value = '';
}

function updateBookmark(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('editBookmarkId').value);
    const name = document.getElementById('editBookmarkName').value;
    const url = document.getElementById('editBookmarkUrl').value;
    const icon = document.getElementById('editBookmarkIcon').value;
    
    // The validation is now handled in the updateBookmark method
    if (bookmarkManager.updateBookmark(id, name, url, icon)) {
        hideEditBookmarkModal();
    }
}

function addBookmark(event) {
    event.preventDefault();
    
    const name = document.getElementById('bookmarkName').value;
    const url = document.getElementById('bookmarkUrl').value;
    const icon = document.getElementById('bookmarkIcon').value;
    
    // The validation is now handled in the addBookmark method
    if (bookmarkManager.addBookmark(name, url, icon)) {
        hideAddBookmarkModal();
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const addModal = document.getElementById('bookmarkModal');
    const editModal = document.getElementById('editBookmarkModal');
    
    if (event.target === addModal) {
        hideAddBookmarkModal();
    }
    if (event.target === editModal) {
        hideEditBookmarkModal();
    }
});

// Initialize bookmarks when DOM is loaded
let bookmarkManager;
document.addEventListener('DOMContentLoaded', function() {
    bookmarkManager = new BookmarkManager();
    
    // Add event listeners for add bookmark modal
    document.getElementById('addBookmarkBtn').addEventListener('click', showAddBookmarkModal);
    document.getElementById('cancelBookmarkBtn').addEventListener('click', hideAddBookmarkModal);
    document.getElementById('bookmarkForm').addEventListener('submit', addBookmark);
    
    // Add event listeners for edit bookmark modal
    document.getElementById('cancelEditBookmarkBtn').addEventListener('click', hideEditBookmarkModal);
    document.getElementById('editBookmarkForm').addEventListener('submit', updateBookmark);
});
