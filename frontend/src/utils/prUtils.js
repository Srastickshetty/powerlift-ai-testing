// src/utils/prUtils.js

export function detectPRs(data) {
  if (!data || data.length === 0) return [];

  let best = -Infinity;

  return data.map((point) => {
    const isPR = point.e1rm > best;

    if (isPR) best = point.e1rm;

    return {
      ...point,
      isPR,
      prDelta: isPR ? Number((point.e1rm - best + point.e1rm).toFixed(1)) : 0,
    };
  });
}
