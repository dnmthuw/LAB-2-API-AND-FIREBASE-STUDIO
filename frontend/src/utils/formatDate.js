export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    
    // Check if same day
    const isToday = date.toDateString() === now.toDateString();
    
    const time = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    if (isToday) {
      return `Today at ${time}`;
    }
    
    const dayMonth = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
    
    return `${time} on ${dayMonth}`;
  } catch (e) {
    return isoString;
  }
};
