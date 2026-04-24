import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import jwt from "jsonwebtoken";
import { supabase } from "./supabaseClient.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


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
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ ADD TRANSACTION
app.post("/transactions", authenticateToken, async (req, res) => {
  try {
    const { description, amount, type } = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          description,
          amount,
          type,
          user_id: req.user.id,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE TRANSACTION
app.delete("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: "Deleted successfully",
      deleted: data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});