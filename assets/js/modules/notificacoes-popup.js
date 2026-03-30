import { getPopupNotificacao } from "../services/notificacoes-service.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getStorageKey(item) {
  return `seven_popup_notificacao_${item.id}`;
}

function shouldShowPopup(item) {
  if (!item?.id) return false;
  const key = getStorageKey(item);
  const mode = item.popupMode || "device_once";
  const saved = localStorage.getItem(key);
  if (!saved) return true;
  if (mode === "always") return true;
  if (mode === "daily") {
    const today = new Date().toISOString().slice(0, 10);
    return saved !== today;
  }
  return false;
}

function persistPopupView(item) {
  const key = getStorageKey(item);
  const mode = item.popupMode || "device_once";
  if (mode === "daily") {
    localStorage.setItem(key, new Date().toISOString().slice(0, 10));
    return;
  }
  localStorage.setItem(key, "shown");
}

function closePopup(wrapper, item) {
  persistPopupView(item);
  wrapper.classList.add("hidden");
  setTimeout(() => wrapper.remove(), 180);
}

function renderPopup(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "notificacao-popup-overlay";
  wrapper.innerHTML = `
    <div class="notificacao-popup-card tipo-${escapeHtml(item.type || item.tipo || "aviso")}" role="dialog" aria-modal="true" aria-label="Notificação">
      <button type="button" class="notificacao-popup-close" aria-label="Fechar">✕</button>
      <span class="notificacao-chip tipo-${escapeHtml(item.type || item.tipo || "aviso")}">${escapeHtml(item.type || item.tipo || "aviso")}</span>
      <h3>${escapeHtml(item.title || "Notificação")}</h3>
      <p>${escapeHtml(item.message || "")}</p>
      <div class="notificacao-popup-actions">
        ${item.buttonLink && item.buttonText ? `<a class="button-primary" href="${escapeHtml(item.buttonLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.buttonText)}</a>` : ""}
        <button type="button" class="button-outline notificacao-popup-dismiss">Fechar</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
  wrapper.querySelector(".notificacao-popup-close")?.addEventListener("click", () => closePopup(wrapper, item));
  wrapper.querySelector(".notificacao-popup-dismiss")?.addEventListener("click", () => closePopup(wrapper, item));
  wrapper.addEventListener("click", (event) => {
    if (event.target === wrapper) closePopup(wrapper, item);
  });
}

export async function initNotificacoesPopup() {
  try {
    const item = await getPopupNotificacao();
    if (!item || !shouldShowPopup(item)) return;
    renderPopup(item);
  } catch (error) {
    console.error("Erro ao inicializar popup de notificação:", error);
  }
}
