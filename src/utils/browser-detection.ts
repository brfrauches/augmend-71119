
interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  mobile: boolean;
}

export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  let name = "Unknown";
  let version = "Unknown";
  let os = "Unknown";
  let mobile = false;

  // Detect browser
  if (userAgent.indexOf("Firefox") > -1) {
    name = "Firefox";
  } else if (userAgent.indexOf("Chrome") > -1) {
    name = "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    name = "Safari";
  } else if (userAgent.indexOf("Edge") > -1) {
    name = "Edge";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
    name = "Internet Explorer";
  }

  // Detect version
  const match = userAgent.match(/(firefox|chrome|safari|edge|msie|rv:)\/?\s*([\d.]+)/i);
  if (match) {
    version = match[2];
  }

  // Detect OS
  if (userAgent.indexOf("Win") > -1) {
    os = "Windows";
  } else if (userAgent.indexOf("Mac") > -1) {
    os = "MacOS";
  } else if (userAgent.indexOf("Linux") > -1) {
    os = "Linux";
  } else if (userAgent.indexOf("Android") > -1) {
    os = "Android";
    mobile = true;
  } else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) {
    os = "iOS";
    mobile = true;
  }

  return { name, version, os, mobile };
}
