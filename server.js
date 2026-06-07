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
  try {

    const message = req.body.message;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message manquant"
      });
    }

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
          included_segments: ["Subscribed Users"],
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
