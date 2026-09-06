export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 30) return "Just now";
  if (secondsAgo < 60) return `${secondsAgo}s ago`;

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;

  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) return `${weeksAgo} week${weeksAgo === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
