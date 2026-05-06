export function formatFreshnessLabel(updatedAt: string, now: Date = new Date()): string {
  const then = new Date(updatedAt).getTime();
  if (!Number.isFinite(then)) return 'Updated recently';

  const diffMs = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 5) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

export interface StreamerCtaCopy {
  eyebrow: string;
  title: string;
  body: string;
  button: string;
}

export function streamerCtaCopy(
  streamerName: string,
  monthly: string,
  owned: boolean
): StreamerCtaCopy {
  if (owned) {
    return {
      eyebrow: 'Already paying for this',
      title: "Get your money's worth.",
      body: `You're already paying ${monthly}/mo for ${streamerName}. Here's what else is worth your time on it.`,
      button: `Show me more on ${streamerName}`,
    };
  }

  return {
    eyebrow: 'Ready?',
    title: "Pick what you'll watch first.",
    body: "Save 2-3 titles, then sign up. So your first month doesn't disappear into the home page.",
    button: 'Plan my month',
  };
}
