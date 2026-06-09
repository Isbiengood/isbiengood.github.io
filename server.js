const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const APP_ID = process.env.ONESIGNAL_APP_ID;
const API_KEY = process.env.ONESIGNAL_API_KEY;

// Vérification serveur + base
app.get("/", async (req, res) => {
  try {

    const result = await pool.query("SELECT NOW()");

    res.json({
      serveur: "Grand Cerf opérationnel",
      base: "connectée",
      heure: result.rows[0].now
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erreur: err.message
    });

  }
});

// Envoi d'alerte
app.post("/alerte", async (req, res) => {

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message manquant"
      });
    }

    console.log("===== NOUVELLE ALERTE =====");
    console.log(message);

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
            fr: "🚨 CODE ROUGE"
          },
          contents: {
            fr: message
          }
        })
      }
    );

    const data = await response.json();

    console.log("Réponse OneSignal :", data);

    res.json({
      success: true,
      result: data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Serveur Grand Cerf démarré sur le port ${PORT}`
  );
});
