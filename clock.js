// Clock functionality for Chrome extension
function updateTime() {
    const now = new Date();
    
    // Current day and date for header
    const currentDay = now.toLocaleDateString('en-US', {
        weekday: 'long'
    });
    const currentDate = `Date: ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    // Update header with current day and date
    const dayDisplay = document.getElementById('currentDay');
    if (dayDisplay) {
        dayDisplay.innerHTML = currentDay;
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
        minute: '2-digit',
        second: '2-digit'
    });
    const australiaDate = now.toLocaleDateString('en-US', {
        timeZone: 'Australia/Sydney',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    // Bangladesh Time (BST)
    const bangladeshTime = now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Dhaka',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const bangladeshDate = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Dhaka',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    // Update time displays with simple format
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
