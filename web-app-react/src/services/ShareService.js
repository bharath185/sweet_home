import LZString from 'lz-string';

export class ShareService {
  /**
   * Compresses home state into an ultra-compact URL-safe string
   */
  static generateShareUrl(homeState, mode = 'presentation') {
    const payload = {
      v: 1,
      mode: mode, // 'presentation' or 'edit'
      data: homeState,
      ts: Date.now()
    };
    const jsonStr = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#plan=${compressed}`;
  }

  /**
   * Decodes a compressed plan from the URL hash
   */
  static loadFromUrl() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('plan=')) {
      return null;
    }

    try {
      const encoded = hash.split('plan=')[1];
      const jsonStr = LZString.decompressFromEncodedURIComponent(encoded);
      if (!jsonStr) return null;

      const payload = JSON.parse(jsonStr);
      return payload;
    } catch (err) {
      console.error('Failed to parse shareable plan link:', err);
      return null;
    }
  }

  /**
   * Copies text to user's clipboard
   */
  static async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-https/local
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    }
  }
}
