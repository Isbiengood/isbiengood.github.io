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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Serveur Grand Cerf démarré sur le port ${PORT}`
  );
});
