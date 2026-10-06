// src/utils/chartUtils.js

export function smoothSeries(data, window = 3) {
  if (!data || data.length === 0) return [];

  return data.map((point, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = data.slice(start, index + 1);

    const avg =
      slice.reduce((sum, p) => sum + p.e1rm, 0) / slice.length;

    return {
      ...point,
      e1rm: Number(avg.toFixed(1)),
    };
  });
}

export function getYAxisDomain(data, paddingPercent = 0.07) {
  if (!data || data.length === 0) return [0, 100];

  const values = data.map((d) => d.e1rm);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const padding = (max - min) * paddingPercent;

  return [
    Math.floor(min - padding),
    Math.ceil(max + padding),
  ];
}
