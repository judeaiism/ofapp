function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const prefix = 'ORD';
  return `${prefix}-${timestamp}-${random}`;
}

export { generateOrderId }; 