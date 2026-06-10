
const messageInput = document.getElementById("message");
const btnCodeRouge = document.getElementById("btn-code-rouge");
const statusDiv = document.getElementById("status");
const historiqueUl = document.getElementById("historique");

const API_URL =
"https://grand-cerf-alerte-api-test.onrender.com";

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
      "Veuillez saisir un message.";
    return;
  }

  statusDiv.textContent =
    "Envoi de l'alerte...";

  try {

    const response = await fetch(
      `${API_URL}/alerte`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
       body: JSON.stringify({
  auteur: "Jean-Marc",
  message: texte
})
      }
    );

    const data = await response.json();

    if (data.success) {

      ajouterHistorique(texte);

      statusDiv.textContent =
        "✅ Alerte envoyée à tous les abonnés.";

      messageInput.value = "";

    } else {

      statusDiv.textContent =
        "❌ Erreur d'envoi.";

      console.error(data);

    }

  } catch (err) {

    console.error(err);

    statusDiv.textContent =
      "❌ Impossible de joindre le serveur.";

  }

});

async function chargerHistorique() {

  try {

    const response = await fetch(
      `${API_URL}/alertes`
    );

    const alertes = await response.json();


    historiqueUl.innerHTML = "";

   alertes.forEach((alerte) => {

  const li = document.createElement("li");

  const date = new Date(
    alerte.date_heure
  );

  const dateStr =
    date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  li.textContent =
    `${dateStr} - ${alerte.auteur} : ${alerte.message}`;

  historiqueUl.appendChild(li);

});

  } catch (err) {

    console.error(
      "Erreur chargement historique",
      err
    );

  }

}

chargerHistorique();
