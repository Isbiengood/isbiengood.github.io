const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const APP_ID = process.env.ONESIGNAL_APP_ID;
const API_KEY = process.env.ONESIGNAL_API_KEY;

app.get("/", (req, res) => {
  res.send("Serveur Grand Cerf opérationnel");
});

app.post("/alerte", async (req, res) => {

  console.log("===== NOUVELLE ALERTE =====");
  console.log("Body reçu :", req.body);

  try {

    const message = req.body.message;

    if (!message) {
      console.log("Message manquant");

      return res.status(400).json({
        success: false,
        error: "Message manquant"
      });
    }

    console.log("Message :", message);
    console.log("App ID :", APP_ID);
    console.log("API Key présente :", !!API_KEY);

    const response = await fetch(
      "https://api.onesignal.com/notifications?c=push",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${API_KEY}`
        },
        body: JSON.stringify({
          app_id: APP_ID,
          included_segments: ["Total Subscriptions"],
          headings: {
            en: "🚨 CODE ROUGE",
            fr: "🚨 CODE ROUGE"
          },
          contents: {
            en: message,
            fr: message
          }
        })
      }
    );

    console.log("Status OneSignal :", response.status);

    const data = await response.json();

    console.log("Réponse OneSignal :");
    console.log(JSON.stringify(data, null, 2));

    res.json({
      success: true,
      result: data
    });

  } catch (err) {

    console.error("ERREUR :");
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur Grand Cerf démarré sur le port ${PORT}`);
});
