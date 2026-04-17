const express = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const notifications = [];
let notificationSeed = 0;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/notifications/email", (req, res) => {
  const { to, subject, template, data } = req.body;
  if (!to || !subject || !template) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "to, subject, template are required" } });
  }

  const notification_id = `ntf_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${String(++notificationSeed).padStart(3, "0")}`;
  const item = {
    notification_id,
    to,
    subject,
    template,
    data: data || {},
    status: "SENT",
    sent_at: new Date().toISOString()
  };
  notifications.push(item);
  return res.status(202).json({ data: { notification_id, status: "QUEUED" } });
});

app.get("/notifications/:id", (req, res) => {
  const item = notifications.find((n) => n.notification_id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Notification not found" } });
  }
  return res.json({ data: item });
});

app.listen(port, () => {
  console.log(`notification-service listening on ${port}`);
});
