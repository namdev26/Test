const express = require("express");

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
let customerIdSeed = 2;
const customers = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "a@gmail.com",
    phone: "0901234567",
    created_at: new Date().toISOString()
  }
];

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/customers", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "name, email, phone are required" } });
  }
  if (customers.some((c) => c.email === email)) {
    return res.status(409).json({ error: { code: "DUPLICATE_EMAIL", message: "Email already exists" } });
  }
  const customer = { id: customerIdSeed++, name, email, phone, created_at: new Date().toISOString() };
  customers.push(customer);
  return res.status(201).json({ data: customer });
});

app.get("/customers/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Customer not found" } });
  }
  return res.json({ data: customer });
});

app.get("/customers/by-email", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "email is required" } });
  }
  const customer = customers.find((c) => c.email === email);
  if (!customer) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Customer not found" } });
  }
  return res.json({ data: customer });
});

app.listen(port, () => {
  console.log(`customer-service listening on ${port}`);
});
