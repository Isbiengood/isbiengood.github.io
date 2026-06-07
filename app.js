const messageInput = document.getElementById("message");
const btnCodeRouge = document.getElementById("btn-code-rouge");
const statusDiv = document.getElementById("status");
const historiqueUl = document.getElementById("historique");

function ajouterHistorique(texte) {
  const li = document.createElement("li");
  const now = new Date();

  const dateStr = now.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  li.textContent = `${dateStr} - ${texte}`;
  historiqueUl.prepend(li);
}

btnCodeRouge.addEventListener("click", async () => {
  const texte = messageInput.value.trim();

  if (!texte) {
    statusDiv.textContent =
      "Merci de saisir un message avant d'envoyer.";
    return;
  }

  statusDiv.textContent = "Envoi de l'alerte...";

  ajouterHistorique(texte);

  // TODO : ici on appellera plus tard ton serveur Render
  // pour déclencher une notification OneSignal à tous les membres.

  setTimeout(() => {
    statusDiv.textContent =
      "Alerte envoyée (simulation locale pour l'instant).";
  }, 500);
});
