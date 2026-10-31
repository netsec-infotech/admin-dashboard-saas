const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const forge = require('node-forge');

function resolveExistingPath(p) {
  const raw = String(p || '').trim();
  if (!raw) return null;
  if (path.isAbsolute(raw)) return fs.existsSync(raw) ? raw : null;

  const candidates = [
    path.resolve(__dirname, '..', '..', raw),
    path.resolve(__dirname, '..', raw),
    path.resolve(__dirname, raw),
    path.resolve(process.cwd(), raw),
    path.resolve(__dirname, '..', '..', 'keys', path.basename(raw)),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  return null;
}

function normalizeEnvPemValue(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';
  const unquoted = raw.replace(/^['"]|['"]$/g, '');
  return unquoted.replace(/\\n/g, '\n').trim();
}

function looksLikeBase64Der(text) {
  const s = String(text || '').trim();
  if (!s || s.length < 128) return false;
  if (!/^MII[A-Za-z0-9+/=\s]+$/.test(s)) return false;
  return s.replace(/\s+/g, '').length % 4 === 0;
}

function readKeyMaterialFromEnvOrPath({ pemEnv, pathEnv }) {
  const pem = String(process.env[pemEnv] || '').trim();
  if (pem) return pem;

  const p = String(process.env[pathEnv] || '').trim();
  if (!p) return null;

  const resolved = resolveExistingPath(p);
  if (!resolved) {
    throw new Error(`${pathEnv} points to a missing file: ${p}`);
  }

  const buf = fs.readFileSync(resolved);
  const asText = buf.toString('utf8');
  if (asText.includes('-----BEGIN')) return asText;
  return buf;
}

function readKeyMaterialFromResolvedPath(resolvedPath) {
  if (!resolvedPath) return null;
  const buf = fs.readFileSync(resolvedPath);
  const asText = buf.toString('utf8');
  if (asText.includes('-----BEGIN')) return asText;
  return buf;
}

let cachedPublicKey = null;
let cachedPrivateKey = null;
let cachedPublicCertificateInfo = null;

function readIciciPublicKeyMaterial() {
  const pem = normalizeEnvPemValue(process.env.ICICI_PUBLIC_KEY_PEM || '');
  if (pem) {
    if (!pem.includes('-----BEGIN') && /[\\/]|\.pem$|\.cer$/i.test(pem)) {
      const resolvedFromPemPath = resolveExistingPath(pem);
      if (resolvedFromPemPath) {
        return readKeyMaterialFromResolvedPath(resolvedFromPemPath);
      }
    }

    if (pem.includes('-----BEGIN')) {
      return pem;
    }

    if (looksLikeBase64Der(pem)) {
      return Buffer.from(pem.replace(/\s+/g, ''), 'base64');
    }

    return pem;
  }

  const configuredPath = String(process.env.ICICI_PUBLIC_KEY_PATH || '').trim();
  if (configuredPath) {
    const resolvedConfiguredPath = resolveExistingPath(configuredPath);
    if (resolvedConfiguredPath) {
      return readKeyMaterialFromResolvedPath(resolvedConfiguredPath);
    }
  }

  const fallbackPaths = [
    'keys/icici_public_key.pem',
    './keys/icici_public_key.pem',
    '../keys/icici_public_key.pem',
    '../../keys/icici_public_key.pem',
    'keys/icici_public_key.cer',
    './keys/icici_public_key.cer',
    '../keys/icici_public_key.cer',
  ];

  for (const fallbackPath of fallbackPaths) {
    const resolvedFallbackPath = resolveExistingPath(fallbackPath);
    if (resolvedFallbackPath) {
      return readKeyMaterialFromResolvedPath(resolvedFallbackPath);
    }
  }

  if (configuredPath) {
    throw new Error(`ICICI_PUBLIC_KEY_PATH points to a missing file: ${configuredPath}`);
  }

  return null;
}

function readIciciPublicCertificateInfo() {
  if (cachedPublicCertificateInfo !== null) return cachedPublicCertificateInfo;

  const material = readIciciPublicKeyMaterial();
  if (!material) {
    cachedPublicCertificateInfo = null;
    return null;
  }

  const asText = typeof material === 'string' ? material : material.toString('utf8');
  if (!asText.includes('BEGIN CERTIFICATE')) {
    cachedPublicCertificateInfo = null;
    return null;
  }

  try {
    const cert = new crypto.X509Certificate(asText);
    const validToMs = Number(new Date(cert.validTo).getTime());
    const validFromMs = Number(new Date(cert.validFrom).getTime());
    const nowMs = Date.now();
    cachedPublicCertificateInfo = {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      isExpired: Number.isFinite(validToMs) ? nowMs > validToMs : false,
      isNotYetValid: Number.isFinite(validFromMs) ? nowMs < validFromMs : false,
    };
    return cachedPublicCertificateInfo;
  } catch {
    cachedPublicCertificateInfo = null;
    return null;
  }
}

function getIciciPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;

  const material = readIciciPublicKeyMaterial();
  if (!material) return null;

  let keyObject = null;

  if (typeof material === 'string') {
    const text = material.trim();
    try {
      if (text.includes('BEGIN CERTIFICATE')) {
        keyObject = new crypto.X509Certificate(text).publicKey;
      } else {
        keyObject = crypto.createPublicKey(text);
      }
    } catch (firstError) {
      if (looksLikeBase64Der(text)) {
        const der = Buffer.from(text.replace(/\s+/g, ''), 'base64');
        try {
          keyObject = new crypto.X509Certificate(der).publicKey;
        } catch {
          keyObject = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
        }
      } else {
        throw firstError;
      }
    }
  } else {
    try {
      keyObject = crypto.createPublicKey({ key: material, format: 'der', type: 'spki' });
    } catch {
      keyObject = new crypto.X509Certificate(material).publicKey;
    }
  }

  cachedPublicKey = keyObject;
  return keyObject;
}

function getClientPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;

  const material = readKeyMaterialFromEnvOrPath({
    pemEnv: 'ICICI_CLIENT_PRIVATE_KEY_PEM',
    pathEnv: 'ICICI_CLIENT_PRIVATE_KEY_P12_PATH',
  });

  if (!material) return null;

  if (typeof material === 'string') {
    cachedPrivateKey = crypto.createPrivateKey({
      key: material,
      format: 'pem',
      passphrase: process.env.ICICI_CLIENT_PRIVATE_KEY_PASSPHRASE || undefined,
    });
    return cachedPrivateKey;
  }

  cachedPrivateKey = crypto.createPrivateKey({
    key: material,
    format: 'der',
    type: 'pkcs12',
    passphrase: process.env.ICICI_CLIENT_PRIVATE_KEY_PASSPHRASE || undefined,
  });

  return cachedPrivateKey;
}

function base64Encode(value) {
  return Buffer.isBuffer(value) ? value.toString('base64') : Buffer.from(value).toString('base64');
}

function base64Decode(value) {
  return Buffer.from(String(value || ''), 'base64');
}

function looksLikeBase64(text) {
  const s = String(text || '').trim();
  if (!s || s.length < 24) return false;
  return /^[A-Za-z0-9+/=\s]+$/.test(s);
}

function pickAesAlgorithm(sessionKey) {
  const len = sessionKey.length;
  if (len === 16) return 'aes-128-cbc';
  if (len === 32) return 'aes-256-cbc';
  throw new Error(`Unsupported session key length ${len}. Expected 16 or 32.`);
}

function encryptIciciPayload(plainObject) {
  const publicKey = getIciciPublicKey();
  if (!publicKey) {
    throw new Error('ICICI public key not configured. Set ICICI_PUBLIC_KEY_PATH or ICICI_PUBLIC_KEY_PEM.');
  }

  const sessionKeyLen = Number(process.env.ICICI_SESSION_KEY_LENGTH || 16);
  const sessionKey = crypto.randomBytes(sessionKeyLen);
  const iv = crypto.randomBytes(16);

  const aesAlgorithm = pickAesAlgorithm(sessionKey);
  const cipher = crypto.createCipheriv(aesAlgorithm, sessionKey, iv);
  const plaintext = JSON.stringify(plainObject ?? {});
  const cipherText = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    sessionKey
  );

  return {
    encryptedKey: base64Encode(encryptedKey),
    iv: base64Encode(iv),
    encryptedData: base64Encode(cipherText),
    oaepHashingAlgorithm: 'NONE',
  };
}

// ICICI QR API doc: body is text/plain containing Base64Encode(RSA/ECB/PKCS1Padding(JSON))
function encryptIciciAsymmetricPayload(plainObject) {
  const publicKey = getIciciPublicKey();
  if (!publicKey) {
    throw new Error('ICICI public key not configured. Set ICICI_PUBLIC_KEY_PATH or ICICI_PUBLIC_KEY_PEM.');
  }

  const plaintext = JSON.stringify(plainObject ?? {});
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(plaintext, 'utf8')
  );

  return base64Encode(encrypted);
}

function decryptIciciAsymmetricPayload(base64CipherText) {
  const privateKey = getClientPrivateKey();
  if (!privateKey) {
    throw new Error(
      'Client private key not configured. Set ICICI_CLIENT_PRIVATE_KEY_P12_PATH (and passphrase) or ICICI_CLIENT_PRIVATE_KEY_PEM.'
    );
  }

  let decrypted;
  try {
    let privateKeyPem;
    try {
      privateKeyPem = privateKey.export({ format: 'pem', type: 'pkcs1' });
    } catch {
      privateKeyPem = privateKey.export({ format: 'pem', type: 'pkcs8' });
    }
    const forgePrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBuffer = base64Decode(base64CipherText);
    decrypted = Buffer.from(
      forgePrivateKey.decrypt(encryptedBuffer.toString('binary'), 'RSAES-PKCS1-V1_5'),
      'binary'
    );
  } catch (forgeError) {
    try {
      decrypted = crypto.privateDecrypt(
        { key: privateKey },
        base64Decode(base64CipherText)
      );
    } catch (fallbackError) {
      throw new Error(
        `Decryption failed: ${String(forgeError?.message || fallbackError?.message || 'Unknown')}`
      );
    }
  }

  const asText = decrypted.toString('utf8').trim();
  if (looksLikeBase64(asText)) {
    try {
      const decoded = base64Decode(asText).toString('utf8').trim();
      try {
        return JSON.parse(decoded);
      } catch {
        return decoded;
      }
    } catch {
      // ignore
    }
  }

  try {
    return JSON.parse(asText);
  } catch {
    return asText;
  }
}

function buildIciciEncryptedRequest({ requestId, service, payload }) {
  const encrypted = encryptIciciPayload(payload);
  return {
    requestId: String(requestId || ''),
    service: String(service || ''),
    encryptedKey: encrypted.encryptedKey,
    oaepHashingAlgorithm: 'NONE',
    iv: encrypted.iv,
    encryptedData: encrypted.encryptedData,
  };
}

function getIciciCryptoStatus() {
  let hasPublicKey = false;
  let publicKeyError = null;
  try {
    hasPublicKey = Boolean(getIciciPublicKey());
  } catch (err) {
    hasPublicKey = false;
    publicKeyError = String(err?.message || err);
  }

  let hasPrivateKey = false;
  let privateKeyError = null;
  try {
    hasPrivateKey = Boolean(getClientPrivateKey());
  } catch (err) {
    hasPrivateKey = false;
    privateKeyError = String(err?.message || err);
  }

  return {
    hasPublicKey,
    publicKeyError,
    hasPrivateKey,
    privateKeyError,
    publicCertificate: readIciciPublicCertificateInfo(),
    sessionKeyLength: Number(process.env.ICICI_SESSION_KEY_LENGTH || 16),
  };
}

function getIciciPublicCertificateInfo() {
  return readIciciPublicCertificateInfo();
}

module.exports = {
  encryptIciciPayload,
  encryptIciciAsymmetricPayload,
  decryptIciciAsymmetricPayload,
  buildIciciEncryptedRequest,
  getIciciCryptoStatus,
  getIciciPublicCertificateInfo,
};
