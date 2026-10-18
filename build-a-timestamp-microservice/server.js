import express from "express";

const app = express();
const port = 8000;

function handleTimestamp(req, res) {
  const input = req.params.date;

  let date;

  if (!input) {
    date = new Date();
  } else if (/^\d+$/.test(input)) {
    date = new Date(Number(input));
  } else {
    date = new Date(input);
  }

  if (Number.isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
}

app.get("/api", handleTimestamp);
app.get("/api/:date", handleTimestamp);

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}`);
});
