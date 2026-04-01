const scheduleDateFormatter = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatScheduleDate(value?: string | null) {
  if (!value) {
    return "No target date";
  }

  const parsed = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return scheduleDateFormatter.format(parsed);
}

export function formatScheduleDateRange(start?: string | null, end?: string | null) {
  if (start && end) {
    return `${formatScheduleDate(start)} to ${formatScheduleDate(end)}`;
  }

  if (start) {
    return `Starts ${formatScheduleDate(start)}`;
  }

  if (end) {
    return `Target finish ${formatScheduleDate(end)}`;
  }

  return "No target range";
}
