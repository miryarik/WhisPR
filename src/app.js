import express, { json } from "express";
const app = express();
app.use(json());

app.post("/webhook", (req, res) => {
  console.log("Event received:", req.headers["x-github-event"]);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).send("ok");
});

app.listen(3000, () => console.log("Listening on port 3000"));
