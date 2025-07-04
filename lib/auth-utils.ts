const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

interface User {
  id: string
  email: string
  name: string
  role: string
  image?: string | null
}

export function createSessionToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  // Create a simple base64 encoded token for serverless compatibility
  return btoa(JSON.stringify(payload))
}

export function verifySessionToken(token: string): User | null {
  if (!token) return null;

  try {
    // Split JWT into parts (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: Not a JWT structure');
      return null;
    }

    // Base64 URL decode (handles URL-safe encoding)
    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('Token expired');
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      image: payload.image,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export const verifyToken = verifySessionToken

export async function getUserFromRequest(request: Request): Promise<User | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    return verifySessionToken(token)
  } catch (error) {
    console.error("Failed to get user from request:", error)
    return null
  }
}
