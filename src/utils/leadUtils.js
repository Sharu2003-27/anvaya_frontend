export const calculateTimeToClose = (lead) => {
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

export const getTimeToCloseValue = (lead) => {
  if (!lead) return 0;
  if (lead.status?.toLowerCase() === 'closed') {
    return 0;
  }
  return calculateTimeToClose(lead);
};

export const getTimeToCloseLabel = (lead) => {
  const days = getTimeToCloseValue(lead);
  return formatTimeToClose(days);
};
