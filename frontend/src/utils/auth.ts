/** Generates a mock JWT-like token (base64 payload only, no real signature). */
export function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 86_400_000 })
  );
  const signature = btoa(`mock-sig-${userId}`);
  return `${header}.${payload}.${signature}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
