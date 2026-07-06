function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function extractFilename(url) {
  return url.split('/').pop();
}

module.exports = { formatDuration, extractFilename };
