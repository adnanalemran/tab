// Bookmarks functionality with localStorage
class BookmarkManager {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.init();
    }

    init() {
        this.renderBookmarks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add bookmark button
        const addBtn = document.getElementById('addBookmarkBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddBookmarkModal());
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBookmarkBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAddBookmarkModal());
        }

        // Form submission
        const form = document.getElementById('bookmarkForm');
        if (form) {
            form.addEventListener('submit', (e) => this.addBookmark(e));
        }

        // Close modal when clicking outside
        const modal = document.getElementById('bookmarkModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAddBookmarkModal();
                }
            });
        }
    }

    loadBookmarks() {
        const stored = localStorage.getItem('newTabBookmarks');
        const bookmarks = stored ? JSON.parse(stored) : [];
        
        // Ensure all bookmarks have order property and sort by it
        bookmarks.forEach((bookmark, index) => {
            if (bookmark.order === undefined) {
                bookmark.order = index;
            }
        });
        
        // Sort by order
        return bookmarks.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    saveBookmarks() {
        localStorage.setItem('newTabBookmarks', JSON.stringify(this.bookmarks));
    }

    addBookmark(event) {
        event.preventDefault();
        
        const name = document.getElementById('bookmarkName').value;
        const url = document.getElementById('bookmarkUrl').value;
        const icon = document.getElementById('bookmarkIcon').value;
        
        if (name && url) {
            const bookmark = {
                id: Date.now(),
                name: name.trim(),
                url: url.trim(),
                icon: icon.trim() || '🔖',
                order: this.bookmarks.length // Add order property
            };
            
            this.bookmarks.push(bookmark);
            this.saveBookmarks();
            this.renderBookmarks();
            this.hideAddBookmarkModal();
        }
    }

    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
        this.reorderBookmarks(); // Reorder after deletion
        this.saveBookmarks();
        this.renderBookmarks();
    }

    reorderBookmarks() {
        // Update order property to maintain sequence
        this.bookmarks.forEach((bookmark, index) => {
            bookmark.order = index;
        });
    }

    moveBookmark(fromIndex, toIndex) {
        const [movedItem] = this.bookmarks.splice(fromIndex, 1);
        this.bookmarks.splice(toIndex, 0, movedItem);
        this.reorderBookmarks();
        this.saveBookmarks();
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksContainer');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">No bookmarks yet. Add some!</p>';
            return;
        }

        container.innerHTML = this.bookmarks.map((bookmark, index) => `
            <a href="${bookmark.url}" 
               class="bookmark-item" 
               target="_blank" 
               rel="noopener noreferrer" 
               data-bookmark-id="${bookmark.id}"
               data-bookmark-index="${index}"
               draggable="true">
                <span class="bookmark-icon">${bookmark.icon}</span>
                <span class="bookmark-name">${bookmark.name}</span>
                <button class="bookmark-delete" data-bookmark-id="${bookmark.id}">×</button>
            </a>
        `).join('');

        // Add event listeners to delete buttons
        container.querySelectorAll('.bookmark-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-bookmark-id'));
                this.removeBookmark(id);
            });
        });

        // Add drag and drop event listeners
        this.setupDragAndDrop(container);
    }

    showAddBookmarkModal() {
        document.getElementById('bookmarkModal').classList.add('show');
        document.getElementById('bookmarkName').focus();
    }

    hideAddBookmarkModal() {
        document.getElementById('bookmarkModal').classList.remove('show');
        document.getElementById('bookmarkName').value = '';
        document.getElementById('bookmarkUrl').value = '';
        document.getElementById('bookmarkIcon').value = '';
    }

    setupDragAndDrop(container) {
        let draggedElement = null;
        let draggedIndex = null;

        container.querySelectorAll('.bookmark-item').forEach(item => {
            // Drag start
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                draggedIndex = parseInt(item.getAttribute('data-bookmark-index'));
                item.classList.add('dragging');
                
                // Prevent link navigation during drag
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
            });

            // Drag end
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                container.querySelectorAll('.bookmark-item').forEach(el => {
                    el.classList.remove('drag-over');
                });
                draggedElement = null;
                draggedIndex = null;
            });

            // Drag over
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (item !== draggedElement) {
                    item.classList.add('drag-over');
                }
            });

            // Drag leave
            item.addEventListener('dragleave', (e) => {
                item.classList.remove('drag-over');
            });

            // Drop
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                if (item !== draggedElement && draggedElement) {
                    const dropIndex = parseInt(item.getAttribute('data-bookmark-index'));
                    
                    // Move the bookmark in the array
                    this.moveBookmark(draggedIndex, dropIndex);
                    this.renderBookmarks();
                }
            });

            // Prevent default link behavior when dragging
            item.addEventListener('click', (e) => {
                if (item.classList.contains('dragging')) {
                    e.preventDefault();
                }
            });
        });
    }
}

// Initialize bookmarks when DOM is loaded
let bookmarkManager;
document.addEventListener('DOMContentLoaded', function() {
    bookmarkManager = new BookmarkManager();
});
