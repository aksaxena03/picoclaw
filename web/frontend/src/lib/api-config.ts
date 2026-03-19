export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Return custom backend url from local storage if set
    return localStorage.getItem("picoclaw-backend-url") || ""
  }
  return ""
}

export function setBaseUrl(url: string) {
  if (typeof window !== "undefined") {
    if (url.trim() === "") {
      localStorage.removeItem("picoclaw-backend-url");
    } else {
      localStorage.setItem("picoclaw-backend-url", url.trim());
    }
  }
}
