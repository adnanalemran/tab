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
            <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
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
        
        // Add event listeners for delete buttons
        this.attachDeleteListeners();
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
