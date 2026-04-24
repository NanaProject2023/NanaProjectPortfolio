import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

import jwt from "jsonwebtoken";
import { supabase } from "./supabaseClient.js";

const { Pool } = pkg;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: "postgres",
        host: "localhost",
        database: "finance_tracker",
        password: "1234",
        port: 5432,
      }
);

// ✅ SIGNUP
app.post("/signup", async (req, res) => {
  console.log("BODY:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Missing fields");
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.log("❌ SUPABASE ERROR:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ SUCCESS:", data);
    return res.status(200).json(data); // ✅ ONLY ONE RESPONSE
  } catch (err) {
    console.log("🔥 SERVER ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("❌ LOGIN ERROR:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("✅ LOGIN SUCCESS");

    return res.json({
      token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    console.log("🔥 SERVER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// ✅ AUTH MIDDLEWARE
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.sendStatus(401);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) return res.sendStatus(403);

    req.user = data.user;
    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    return res.sendStatus(500);
  }
};



// ✅ GET TRANSACTIONS
app.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1",
      [userId]
    );

    res.json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD TRANSACTION
app.post("/transactions", authenticateToken, async (req, res) => {
  try {
    console.log("🔥 BODY:", req.body);
    console.log("🔥 USER:", req.user);

    const { description, amount, type } = req.body;
    const userId = req.user.id;

    console.log("🔥 INSERT VALUES:", {
      description,
      amount,
      type,
      userId,
    });

    const result = await pool.query(
      "INSERT INTO transactions (description, amount, type, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [description, Number(amount), type, userId]
    );

    return res.json(result.rows[0]);

  } catch (err) {
    console.log("🔥 FULL ERROR:", err);
    console.log("🔥 DETAIL:", err.detail);
    console.log("🔥 CODE:", err.code);
    console.log("🔥 TABLE ERROR:", err.table);

    return res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE TRANSACTION
app.delete("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});