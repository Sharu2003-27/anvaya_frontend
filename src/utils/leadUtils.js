export const getDaysSince = (dateStr) => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const getTimeToCloseValue = (lead) => {
  if (!lead) return 0;

  // If closed, remaining days should always be 0
  if (lead.status === 'Closed' || lead.closedAt) return 0;

  // The saved timeToClose is considered as an initial estimate (days).
  // We'll reduce it by the number of full days passed since createdAt.
  const original = Number(lead.timeToClose || 0);
  const daysSince = getDaysSince(lead.createdAt);
  const remaining = Math.max(0, original - daysSince);
  return remaining;
};

export const getTimeToCloseLabel = (lead) => {
  const value = getTimeToCloseValue(lead);
  return `${value} day${value === 1 ? '' : 's'}`;
};

