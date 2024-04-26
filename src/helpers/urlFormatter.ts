/**
 * Checks if string starts with a protocol (http:// or https://)
 *
 * @param {string} url
 * @returns {boolean}
 */
export function hasProtocol(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Removes the protocol from a URL
 *
 * @param {string} url
 * @returns {string}
 */
export function removeProtocol(url: string) {
  return url.replace("http://", "").replace("https://", "");
}

/**
 * Adds a protocol to a URL, if it doesn't already have one
 *
 * @param {string} url
 * @param {string} protocol - http:// or https:// by default its https://
 * @returns {string}
 */
export function addProtocolIfMissing(url: string, protocol = "https://") {
  return hasProtocol(url) ? url : protocol + url;
}

/**
 * Returns true if a string looks like it is starting with a protocol. This is useful when passing partially written or incomplete URLs and determening if we should add a protocol to it even if the string isn't a valid URL yet.
 *
 * It will return true if the first letter is an "h" or "H" and the second letter is a "t" or "T", etc
 *
 * "h" will return true
 * "ht" will return true
 * "htt" will return true
 * "hot" will return false
 * "a" will return false
 * "htp" will return false
 * "http" will return true
 * "https:/a" will return false
 *
 *
 * @param {string} url
 * @returns {boolean}
 *
 */
export function looksLikeStartingWithProtocol(url: string) {
  //   If it does not start with "h" or "H" return false
  if (!url.startsWith("h") && !url.startsWith("H")) {
    return false;
  }

  //   if the second letter is not a "t" or "T" return false
  if (!url[1]?.toLowerCase().startsWith("t")) {
    return false;
  }

  // if the third letter is not a "t" or "T" return false
  if (!url[2]?.toLowerCase().startsWith("t")) {
    return false;
  }

  // if the fourth letter is not a "p" or "P" return false
  if (!url[3]?.toLowerCase().startsWith("p")) {
    return false;
  }

  // If the fifth letter is not a ":" or "s" return false
  if (!url[4]?.startsWith(":") && !url[4].toLowerCase().startsWith("s")) {
    return false;
  }

  //   If the sixth letter is not a ":" or "/" return false
  if (!url[5]?.startsWith(":") && !url[5].startsWith("/")) {
    return false;
  }

  // If the seventh letter is not a "/" return false
  if (!url[6]?.startsWith("/")) {
    return false;
  }

  return true;
}

/**
 * Softly adds protocol if missing. It will only add a protocol if the user doesnt sem to be in the process of adding one themselves.
 *
 * @param {string} url
 * @param {string} protocol
 */
export function softlyAddProtocolIfMissing(url: string, protocol = "https://") {
  return looksLikeStartingWithProtocol(url) ? url : protocol + url;
}

/**
 * Format the string by softly adding a protocol if missing and lowercasing the string
 *
 * @param {string} url
 * @param {string} protocol
 */
export function formatUrl(url: string, protocol = "https://") {
  return softlyAddProtocolIfMissing(url, protocol)
    .toLowerCase()
    .trim()
    .replace(/ /g, "");
}
