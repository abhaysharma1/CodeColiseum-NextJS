// lib/seb.ts
import crypto from 'crypto';

const SEB_CONFIG_KEY = process.env.SEB_CONFIG_KEY!; // from your .seb file

export function verifyExamHash(url: string, receivedHash: string): boolean {
    const expectedHash = crypto
        .createHash('sha256')
        .update(url + SEB_CONFIG_KEY)
        .digest('hex');

    // constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(expectedHash),
        Buffer.from(receivedHash)
    );
}