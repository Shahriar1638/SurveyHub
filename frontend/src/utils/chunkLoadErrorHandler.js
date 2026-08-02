const RETRY_KEY = "chunk-retry-attempted";

export function initChunkLoadErrorHandler() {
  if (sessionStorage.getItem(RETRY_KEY)) return;

  const isChunkAsset = (url = "") => typeof url === "string" && url.includes("/assets/");

  const onError = (event) => {
    const el = event.target;
    if (!el || (el.tagName !== "SCRIPT" && el.tagName !== "LINK")) return;
    if (!isChunkAsset(el.src || el.href || "")) return;

    sessionStorage.setItem(RETRY_KEY, "1");
    window.location.reload();
  };

  window.addEventListener("error", onError, true);
}
