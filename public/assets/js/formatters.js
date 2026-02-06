function dateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function stars(rating = 0) {
  return `${Number(rating || 0).toFixed(1)} ★`;
}
