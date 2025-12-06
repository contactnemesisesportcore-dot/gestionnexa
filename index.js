import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Render ping route
app.get("/", (req, res) => {
  res.send("Bot en ligne (toujours ON)");
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🔥 Serveur lancé sur le port ${PORT}`);
});
