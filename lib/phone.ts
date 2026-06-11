const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export function normalizeMobileNumber(value: string): string {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^0-9]/g, '');
    return digits ? `+${digits}` : '';
  }

  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits ? `+${digits}` : '';
}

export function isValidMobileNumber(value: string): boolean {
  return E164_PHONE_REGEX.test(normalizeMobileNumber(value));
}
