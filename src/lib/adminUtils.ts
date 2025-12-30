// Admin utility functions

/**
 * Format duration in seconds to human-readable string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds < 60) return "< 1m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format session time in milliseconds to mm:ss format
 */
export const formatSessionTime = (ms: number | null): string => {
  if (!ms) return "--:--";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Format date to relative time string (e.g., "5m ago", "2h ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Export data to CSV file and trigger download
 */
export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: string[]
): void => {
  if (data.length === 0) return;

  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/**
 * Filter users based on search query
 */
export const filterUsers = (
  users: { nickname: string; user_id: string }[],
  searchQuery: string
): typeof users => {
  if (!searchQuery.trim()) return users;
  const query = searchQuery.toLowerCase();
  return users.filter(user => 
    user.nickname?.toLowerCase().includes(query) ||
    user.user_id.toLowerCase().includes(query)
  );
};

/**
 * Get greeting based on time of day
 */
export const getAdminGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format large numbers with K/M suffix
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};
