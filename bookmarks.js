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
        return stored ? JSON.parse(stored) : [];
    }

    saveBookmarks() {
        localStorage.setItem('newTabBookmarks', JSON.stringify(this.bookmarks));
    }

    addBookmark(name, url, icon = '🔖') {
        const bookmark = {
            id: Date.now(),
            name: name.trim(),
            url: url.trim(),
            icon: icon.trim() || '🔖'
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
    }

    removeBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete "${bookmark.name}"?`)) {
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
            this.saveBookmarks();
            this.renderBookmarks();
            
            // Show success message briefly
            this.showNotification('Bookmark deleted successfully!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `bookmark-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksContainer');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">No bookmarks yet. Add some!</p>';
            return;
        }

        container.innerHTML = this.bookmarks.map(bookmark => `
            <div class="bookmark-item" 
                 data-bookmark-id="${bookmark.id}"
                 draggable="true"
                 title="Drag to reorder • Click to visit">
                <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
                <a href="${bookmark.url}" class="bookmark-link" target="_blank" rel="noopener noreferrer">
                    <span class="bookmark-icon">${bookmark.icon}</span>
                    <span class="bookmark-name">${bookmark.name}</span>
                </a>
                <button class="bookmark-delete" 
                        data-bookmark-id="${bookmark.id}"
                        data-bookmark-name="${bookmark.name}"
                        title="Delete '${bookmark.name}'"
                        aria-label="Delete bookmark ${bookmark.name}">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        `).join('');
        
        // Add event listeners for delete buttons and drag & drop
        this.attachDeleteListeners();
        this.attachDragAndDropListeners();
        this.attachTouchListeners();
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

    attachDragAndDropListeners() {
        const bookmarkItems = document.querySelectorAll('.bookmark-item');
        
        bookmarkItems.forEach(item => {
            // Prevent dragging when clicking on link or delete button
            const link = item.querySelector('.bookmark-link');
            const deleteBtn = item.querySelector('.bookmark-delete');
            
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

            // Drag start event
            item.addEventListener('dragstart', (e) => {
                // Only allow drag if not clicking on link or delete button
                if (e.target.closest('.bookmark-link') || e.target.closest('.bookmark-delete')) {
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
                // Only start drag if touching the drag handle or item itself (not link or delete)
                if (e.target.closest('.bookmark-link') || e.target.closest('.bookmark-delete')) {
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

function addBookmark(event) {
    event.preventDefault();
    
    const name = document.getElementById('bookmarkName').value;
    const url = document.getElementById('bookmarkUrl').value;
    const icon = document.getElementById('bookmarkIcon').value;
    
    if (name && url) {
        bookmarkManager.addBookmark(name, url, icon);
        hideAddBookmarkModal();
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('bookmarkModal');
    if (event.target === modal) {
        hideAddBookmarkModal();
    }
});

// Initialize bookmarks when DOM is loaded
let bookmarkManager;
document.addEventListener('DOMContentLoaded', function() {
    bookmarkManager = new BookmarkManager();
    
    // Add event listeners for modal
    document.getElementById('addBookmarkBtn').addEventListener('click', showAddBookmarkModal);
    document.getElementById('cancelBookmarkBtn').addEventListener('click', hideAddBookmarkModal);
    document.getElementById('bookmarkForm').addEventListener('submit', addBookmark);
});
