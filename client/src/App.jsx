import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };



const [token, setToken] = useState(localStorage.getItem("token"));
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLogin, setIsLogin] = useState(true);


const handleAuth = async () => {
  try {
    const url = isLogin
      ? "http://localhost:5000/login"
      : "http://localhost:5000/signup";

    const res = await axios.post(url, { email, password });

    // only login returns token
    if (isLogin) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } else {
      alert("Signup successful! Please login.");
      setIsLogin(true);
    }
  } catch (err) {
    console.error(err);
    alert("Auth failed");
  }
};
  



  useEffect(() => {
    if (token){
    fetchTransactions();
    }
  }, [token]);

const fetchTransactions = async () => {
  const res = await axios.get("http://localhost:5000/transactions", {
    headers: { Authorization: `Bearer ${token}` },
  });
  setTransactions(res.data);
};

const addTransaction = async () => {
  await axios.post(
    "http://localhost:5000/transactions",
    { description, amount, type },
    { headers: { Authorization: `Bearer ${token}` } }
    
  );
  setDescription("");
  setAmount("");
  setType("expense"); 

  fetchTransactions();
};

const deleteTransaction = async (id) => {
  await axios.delete(`http://localhost:5000/transactions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  fetchTransactions();
};






  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  
  
  if (!token) {
  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Signup"}</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleAuth}>
        {isLogin ? "Login" : "Signup"}
      </button>

      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin
          ? "Don't have an account? Signup"
          : "Already have an account? Login"}
      </p>
    </div>
  );
}
  
  
  
  
  
  
    return (
    <div className="container">
      <h1 className="app-title">Personal Finance Tracker</h1>

      <div className="summary">
        <h3>Balance: ${income - expense}</h3>
        <p id="income">Income: ${income}</p>
        <p id="expenses">Expenses: ${expense}</p>
      </div>

      <div className="form">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button onClick={addTransaction}>Add</button>
      </div>



    <div className={darkMode ? "app dark" : "app"}>
      <h1 id="expense-tracker">Expense Tracker</h1>

      <button onClick={toggleTheme} className="toggle-btn">
        {darkMode ? "Light Mode " : "Dark Mode "}
      </button>

      {
      <ul>
        {transactions.map((t) => (
          <li  className="list-item" key={t.id}>
            {t.description} - ${t.amount} ({t.type})
            <button className="deldel" onClick={() => deleteTransaction(t.id)}>X</button>
          </li>
        ))}
      </ul>
      }

    </div>





<button id="logout-button"
  onClick={() => {
    localStorage.removeItem("token");
    setToken(null);
  }}
>
  Logout
</button>





    </div>
  );
}

export default App;