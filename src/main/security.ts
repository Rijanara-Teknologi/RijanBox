import * as crypto from 'crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

export function generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function hashPin(pin: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(
            pin,
            salt,
            SCRYPT_KEYLEN,
            { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLELIZATION },
            (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            }
        );
    });
}

export async function verifyPin(pin: string, salt: string, storedHash: string): Promise<boolean> {
    const hash = await hashPin(pin, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

export function generateServiceId(): string {
    return `svc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

export function generatePartitionId(serviceName: string): string {
    const slug = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const rand = crypto.randomBytes(4).toString('hex');
    return `persist:${slug}-${rand}`;
}
