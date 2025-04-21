export function returnToDash() {
  window.location.href = "/";
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago") if less than a week old,
 * or as a simple date (e.g., "4/20/25") if older than a week.
 * 
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatRelativeDate(date) {
    if (!date) return "";
    
    const createdDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    
    // Format as relative time if less than a week old
    if (diffWeeks < 1) {
        if (diffMins < 60) {
            return `Created ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return `Created ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return `Created ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
    } else {
        // Format as MM/DD/YY for older decks
        const month = createdDate.getMonth() + 1; // getMonth() returns 0-11
        const day = createdDate.getDate();
        const year = createdDate.getFullYear().toString().slice(-2); // Get last 2 digits of year
        
        return `Created ${month}/${day}/${year}`;
    }
}
