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
async function initialiserBase() {

  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(100) NOT NULL,
        admin BOOLEAN DEFAULT FALSE,
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alertes (
        id SERIAL PRIMARY KEY,
        auteur VARCHAR(100),
        message TEXT NOT NULL,
        date_heure TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const utilisateurs = [
      ["Jean-Marc", "Administrateur", true],
      ["Marine", "Administratrice", true],
      ["Joann", "Directeur technique", false],
      ["Arthur", "Technicien", false],
      ["Dylan", "Espaces verts", false],
      ["Diannou", "Espaces verts", false],
      ["Emma", "Stagiaire direction", false],
      ["Isabelle", "Gouvernante", false],
      ["Sam", "Gouvernante", false]
    ];

    for (const [nom, role, admin] of utilisateurs) {

      await pool.query(
        `
        INSERT INTO utilisateurs (nom, role, admin)
        VALUES ($1, $2, $3)
        ON CONFLICT (nom) DO NOTHING
        `,
        [nom, role, admin]
      );

    }

    console.log("Base initialisée");

  } catch (err) {

    console.error("Erreur initialisation base :", err);

  }

}

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

    const { message, auteur } = req.body;
 
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message manquant"
      });
    }

    console.log("===== NOUVELLE ALERTE =====");
    console.log(message);
    await pool.query(
  `
  INSERT INTO alertes (auteur, message)
  VALUES ($1, $2)
  `,
  [auteur || "Inconnu", message]
);

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

app.get("/utilisateurs", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT nom, role, admin, actif
      FROM utilisateurs
      ORDER BY nom
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erreur: err.message
    });

  }

});

app.get("/alertes", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        id,
        auteur,
        message,
        date_heure
      FROM alertes
      ORDER BY date_heure DESC
      LIMIT 100
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erreur: err.message
    });

  }

});

const PORT = process.env.PORT || 3000;

initialiserBase().then(() => {

  app.listen(PORT, () => {

    console.log(
      `Serveur Grand Cerf démarré sur le port ${PORT}`
    );

  });

});
