// ---------- DOM refs ----------
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const netTotalEl = document.getElementById("net-total");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const addBtn = document.getElementById("add-btn");

const txListEl = document.getElementById("transaction-list");
const monthlySummaryEl = document.getElementById("monthly-summary");

// ---------- State ----------
let transactions = [];

// ---------- Init ----------
init();

function init() {
  const saved = localStorage.getItem("transactions");
  transactions = saved ? JSON.parse(saved) : [];
  renderAll();
}

// ---------- Event listeners ----------
addBtn.addEventListener("click", handleAdd);
amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAdd();
});
descriptionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAdd();
});

// ---------- Handlers ----------
function handleAdd() {
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;

  if (!description) {
    alert("Please enter a description.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount.");
    return;
  }

  const tx = {
    id: Date.now(),
    description,
    amount,
    type,
    date: new Date().toISOString(),
  };

  transactions.push(tx);
  persist();
  renderAll();

  descriptionInput.value = "";
  amountInput.value = "";
  typeSelect.value = "income";
  descriptionInput.focus();
}

// ---------- Rendering ----------
function renderAll() {
  renderTotals();
  renderMonthlySummary();
  renderTransactions();
}

function renderTotals() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  incomeEl.textContent = formatNumber(income);
  expenseEl.textContent = formatNumber(expense);
  balanceEl.textContent = formatNumber(balance);
  netTotalEl.textContent = formatNumber(balance); // Net = Income - Expense
}

// ---- Monthly Summary ----
function renderMonthlySummary() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthIncome = transactions
    .filter(
      (t) =>
        t.type === "income" &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);

  monthlySummaryEl.textContent = `Income: ₹${formatNumber(
    monthIncome
  )} | Expense: ₹${formatNumber(monthExpense)}`;
}

function renderTransactions() {
  txListEl.innerHTML = "";

  if (transactions.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No transactions yet.";
    li.style.color = "#666";
    li.style.border = "none";
    txListEl.appendChild(li);
    return;
  }

  transactions
    .slice()
    .sort((a, b) => b.id - a.id)
    .forEach((t) => {
      const li = document.createElement("li");
      li.classList.add(t.type);

      const left = document.createElement("span");
      left.textContent = `${t.description} (${formatDate(t.date)})`;

      const right = document.createElement("span");
      right.textContent = `${
        t.type === "expense" ? "-" : "+"
      }₹${formatNumber(t.amount)}`;

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.title = "Delete";
      delBtn.innerHTML = "✕";
      delBtn.addEventListener("click", () => removeTransaction(t.id));

      li.appendChild(left);
      li.appendChild(right);
      li.appendChild(delBtn);

      txListEl.appendChild(li);
    });
}

// ---------- Utils ----------
function persist() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  persist();
  renderAll();
}

function formatNumber(num) {
  return num.toFixed(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
