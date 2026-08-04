import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import pool from '../database/connection';
import { AppError } from '../utils/errors';

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
}

export interface MFAVerifyInput {
  totpCode: string;
}

// Generate TOTP secret and QR code
export async function generateMFASecret(userId: string, email: string): Promise<MFASetupResponse> {
  // Generate TOTP secret
  const secret = speakeasy.generateSecret({
    name: `SSS Demo (${email})`,
    issuer: 'SSS Modernization',
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new AppError(500, 'Failed to generate MFA secret');
  }

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
  };
}

// Verify TOTP code and enable MFA
export async function verifyAndEnableMFA(
  userId: string,
  secret: string,
  totpCode: string
): Promise<void> {
  // Verify the TOTP code
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: totpCode,
    window: 2, // Allow 2 time windows (±30 seconds)
  });

  if (!isValid) {
    throw new AppError(400, 'Invalid authentication code', 'INVALID_TOTP');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Save MFA device
    await client.query(
      `INSERT INTO mfa_devices (user_id, device_name, secret_key, verified)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Primary Device', secret, true]
    );

    // Enable MFA on user account
    await client.query(
      `UPDATE users SET mfa_enabled = true, updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Verify TOTP code during login
export async function verifyMFACode(userId: string, totpCode: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT secret_key FROM mfa_devices WHERE user_id = $1 AND verified = true LIMIT 1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(400, 'MFA device not found');
  }

  const secret = result.rows[0].secret_key;

  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: totpCode,
    window: 2,
  });
}

// Check if user has MFA enabled
export async function isMFAEnabled(userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT mfa_enabled FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  return result.rows[0].mfa_enabled;
}

// Disable MFA
export async function disableMFA(userId: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete MFA devices
    await client.query(`DELETE FROM mfa_devices WHERE user_id = $1`, [userId]);

    // Disable MFA on user
    await client.query(
      `UPDATE users SET mfa_enabled = false, updated_at = NOW() WHERE id = $1`,
      [userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
