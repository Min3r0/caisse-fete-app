let minuterie = null;

export function toast(message) {
  const bulle = document.createElement("div");
  bulle.className = "toast";
  bulle.textContent = message;
  document.body.appendChild(bulle);
  clearTimeout(minuterie);
  minuterie = setTimeout(() => bulle.remove(), 2600);
}
