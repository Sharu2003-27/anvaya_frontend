export const calculateTimeToClose = (lead) => {
  // If status is closed, return 0
  if (lead.status?.toLowerCase() === 'closed') {
    return 0;
  }

  if (lead.targetCloseDate) {
    const today = new Date();
    const closeDate = new Date(lead.targetCloseDate);

    const diffTime = closeDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0 ? 0 : diffDays;
  }

  if (lead.timeToClose !== undefined) {
    if (lead.createdAt) {
      const createdDate = new Date(lead.createdAt);
      const today = new Date();
      const daysPassed = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      const remaining = lead.timeToClose - daysPassed;

      return remaining < 0 ? 0 : remaining;
    }
    return lead.timeToClose;
  }

  return 0;
};

export const formatTimeToClose = (days) => {
  if (days === 0) return 'Closed';
  if (days === 1) return '1 day';
  return `${days} days`;
};

// Returns the numeric remaining days to close for a lead,
// always treating closed leads as 0.
export const getTimeToCloseValue = (lead) => {
  if (!lead) return 0;
  // Closed leads are always considered 0 days remaining, regardless of stored value
  if (lead.status?.toLowerCase() === 'closed') {
    return 0;
  }
  return calculateTimeToClose(lead);
};

// Returns a human readable label (e.g. "Closed", "1 day", "5 days").
export const getTimeToCloseLabel = (lead) => {
  const days = getTimeToCloseValue(lead);
  return formatTimeToClose(days);
};
