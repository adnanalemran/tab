// Clock functionality for Chrome extension
function updateTime() {
    const now = new Date();
    
    // Current time for main display
    const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Current date for main display
    const currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    // Update main time and date displays
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.innerHTML = currentTime;
    }
    
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.innerHTML = currentDate;
    }
    
    // Australia Time (AEDT/AEST)
    const australiaTime = now.toLocaleTimeString('en-US', { 
        timeZone: 'Australia/Sydney',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Bangladesh Time (BST)
    const bangladeshTime = now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Dhaka',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update timezone displays
    const australiaDisplay = document.getElementById('australiaTime');
    if (australiaDisplay) {
        australiaDisplay.innerHTML = australiaTime;
    }
    
    const bangladeshDisplay = document.getElementById('bangladeshTime');
    if (bangladeshDisplay) {
        bangladeshDisplay.innerHTML = bangladeshTime;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 1000);
});
