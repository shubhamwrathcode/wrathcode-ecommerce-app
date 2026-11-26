export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** Human friendly order id: SV2611241234 */
export function orderId(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rnd = String(Math.floor(1000 + Math.random() * 9000));
  return `SV${yy}${mm}${dd}${rnd}`;
}
