export const formatINR = (paise) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(rupees);
};

export const parseINR = (value) => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  const rupees = parseFloat(cleaned) || 0;
  return Math.round(rupees * 100); // Convert to paise
};

export const formatINRInput = (value) => {
  // Format for display in input (e.g., "12,34,000")
  const num = parseFloat(value) || 0;
  // Explicitly handle 0 to ensure it displays as "0"
  if (num === 0) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(num);
};

