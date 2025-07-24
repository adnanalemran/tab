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
        this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
        this.saveBookmarks();
        this.renderBookmarks();
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksContainer');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">No bookmarks yet. Add some!</p>';
            return;
        }

        container.innerHTML = this.bookmarks.map(bookmark => `
            <a href="${bookmark.url}" class="bookmark-item" target="_blank" rel="noopener noreferrer">
                <span class="bookmark-icon">${bookmark.icon}</span>
                <span class="bookmark-name">${bookmark.name}</span>
                <button class="bookmark-delete" onclick="event.preventDefault(); event.stopPropagation(); bookmarkManager.removeBookmark(${bookmark.id})">×</button>
            </a>
        `).join('');
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
