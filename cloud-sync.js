import { createClient } from "./vendor/supabase.js";

const AUTH_OVERLAY_ID = "dolmatovCloudAuth";

function cloudConfig() {
  const config = window.DOLMATOV_CLOUD_CONFIG || {};
  return {
    url: String(config.url || "").trim(),
    publishableKey: String(config.publishableKey || "").trim()
  };
}

function setSyncState(state, label) {
  document.body.dataset.cloudState = state;
  const button = document.querySelector("#syncButton");
  if (!button) return;
  button.dataset.cloudState = state;
  button.title = label;
  button.setAttribute("aria-label", label);
}

function authOverlay() {
  let overlay = document.querySelector(`#${AUTH_OVERLAY_ID}`);
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = AUTH_OVERLAY_ID;
  overlay.className = "cloud-auth-layer";
  overlay.innerHTML = `
    <section class="cloud-auth-card" role="dialog" aria-modal="true" aria-labelledby="cloudAuthTitle">
      <div class="cloud-auth-brand">Dolmatov Life OS</div>
      <h1 id="cloudAuthTitle">Вход владельца</h1>
      <p>Ваши дела и база знаний синхронизируются между устройствами.</p>
      <form id="cloudAuthForm">
        <label><span>Почта</span><input name="email" type="email" autocomplete="username" required></label>
        <label><span>Пароль</span><input name="password" type="password" autocomplete="current-password"></label>
        <div class="cloud-auth-error" id="cloudAuthError" aria-live="polite"></div>
        <button class="primary-action" type="submit">Войти</button>
        <button class="secondary-action cloud-magic-link" type="button">Получить ссылку на почту</button>
      </form>
    </section>`;
  document.body.append(overlay);
  return overlay;
}

function waitForOwnerSession(client) {
  return new Promise((resolve) => {
    const overlay = authOverlay();
    const form = overlay.querySelector("#cloudAuthForm");
    const errorHost = overlay.querySelector("#cloudAuthError");
    const submit = form.querySelector('button[type="submit"]');
    const magicLink = form.querySelector(".cloud-magic-link");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorHost.textContent = "";
      submit.disabled = true;
      submit.textContent = "Входим…";
      const data = new FormData(form);
      const { data: authData, error } = await client.auth.signInWithPassword({
        email: String(data.get("email") || "").trim(),
        password: String(data.get("password") || "")
      });
      submit.disabled = false;
      submit.textContent = "Войти";
      if (error || !authData.session) {
        errorHost.textContent = "Не удалось войти. Проверьте почту и пароль.";
        return;
      }
      overlay.remove();
      resolve(authData.session);
    });
    magicLink.addEventListener("click", async () => {
      errorHost.textContent = "";
      const email = String(new FormData(form).get("email") || "").trim();
      if (!email) {
        errorHost.textContent = "Укажите почту.";
        form.elements.email.focus();
        return;
      }
      magicLink.disabled = true;
      magicLink.textContent = "Отправляем…";
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: redirectUrl }
      });
      magicLink.disabled = false;
      magicLink.textContent = "Получить ссылку на почту";
      errorHost.textContent = error
        ? "Не удалось отправить ссылку. Проверьте почту."
        : "Ссылка отправлена. Откройте письмо на этом устройстве.";
    });
  });
}

export async function createCloudSync({ structureVersion, localSnapshot }) {
  const config = cloudConfig();
  if (!config.url || !config.publishableKey) {
    setSyncState("local", "Данные хранятся локально");
    return { mode: "local", remoteSnapshot: null, queue() {} };
  }

  setSyncState("connecting", "Подключение к облаку");
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  let { data: sessionData } = await client.auth.getSession();
  const session = sessionData.session || await waitForOwnerSession(client);
  const ownerId = session.user.id;

  const { data: savedRow, error: readError } = await client
    .from("owner_state")
    .select("snapshot, structure_version, updated_at")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (readError) {
    setSyncState("error", "Ошибка облачной синхронизации");
    throw readError;
  }

  let remoteSnapshot = savedRow?.snapshot || null;
  if (!remoteSnapshot && localSnapshot) {
    const parsedSnapshot = typeof localSnapshot === "string" ? JSON.parse(localSnapshot) : localSnapshot;
    const { error: importError } = await client.from("owner_state").upsert({
      owner_id: ownerId,
      snapshot: parsedSnapshot,
      structure_version: structureVersion,
      updated_at: new Date().toISOString()
    });
    if (importError) throw importError;
    remoteSnapshot = parsedSnapshot;
  }

  let saveTimer = null;
  let pendingSnapshot = null;
  let saving = false;

  const persist = async () => {
    if (saving || !pendingSnapshot) return;
    saving = true;
    const snapshot = pendingSnapshot;
    pendingSnapshot = null;
    setSyncState("saving", "Сохраняем изменения");
    const { error } = await client.from("owner_state").upsert({
      owner_id: ownerId,
      snapshot: JSON.parse(snapshot),
      structure_version: structureVersion,
      updated_at: new Date().toISOString()
    });
    saving = false;
    if (error) {
      pendingSnapshot = snapshot;
      setSyncState("error", "Изменения сохранены на устройстве, облако временно недоступно");
      return;
    }
    setSyncState("synced", "Все изменения сохранены");
    if (pendingSnapshot) persist();
  };

  setSyncState("synced", "Все изменения сохранены");
  return {
    mode: "cloud",
    remoteSnapshot,
    queue(snapshot) {
      pendingSnapshot = snapshot;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(persist, 450);
    }
  };
}
