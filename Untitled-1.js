const form = document.getElementById('transactionForm');
const tableBody = document.getElementById('transactionTableBody');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const currentBalanceEl = document.getElementById('currentBalance');
const filterSelect = document.getElementById('filterType');
const noTransactionsMsg = document.getElementById('noTransactions');

let transactions = [];

function loadTransactions() {
    let storedData = localStorage.getItem('transactions');
    if (storedData) {
        transactions = JSON.parse(storedData);
        alert("✅ Previous transactions loaded successfully! (" + transactions.length + " records found)");
    } else {
        alert("ℹ️ Welcome! No previous transactions found. Start adding your income and expenses.");
    }
    renderTable();
    calculateTotals();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

form.addEventListener('submit', function(event) {
    event.preventDefault(); 

    let type = document.getElementById('type').value;
    let description = document.getElementById('description').value;
    let amount = parseFloat(document.getElementById('amount').value);
    let category = document.getElementById('category').value;
    let date = document.getElementById('date').value;

    if (description.trim() === "") {
        alert("⚠️ Please enter a description.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("⚠️ Amount must be greater than zero.");
        return;
    }

    if (date === "") {
        alert("⚠️ Please select a transaction date.");
        return;
    }

    let transaction = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    transactions.push(transaction);
    saveTransactions();

    form.reset();
    renderTable();
    calculateTotals();

    alert("✅ Transaction added successfully!\n\n" +
          "Type: " + type + "\n" +
          "Description: " + description + "\n" +
          "Amount: LKR " + amount.toFixed(2) + "\n" +
          "Category: " + category + "\n" +
          "Date: " + date);
});

function renderTable() {
    tableBody.innerHTML = ''; 

    let filterValue = filterSelect.value;
    let filteredTransactions = transactions;

    if (filterValue !== 'All') {
        filteredTransactions = transactions.filter(function(t) {
            return t.type === filterValue;
        });
    }

    if (filteredTransactions.length === 0) {
        noTransactionsMsg.style.display = 'block';
    } else {
        noTransactionsMsg.style.display = 'none';
    }

    for (let i = 0; i < filteredTransactions.length; i++) {
        let t = filteredTransactions[i];
        let row = document.createElement('tr');

        let badgeClass = '';
        if (t.type === 'Income') {
            badgeClass = 'bg-success';
        } else {
            badgeClass = 'bg-danger';
        }

        let amountSign = '';
        let amountColor = '';
        if (t.type === 'Income') {
            amountSign = '+';
            amountColor = 'green';
        } else {
            amountSign = '-';
            amountColor = 'red';
        }

        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td><span class="badge ${badgeClass}">${t.type}</span></td>
            <td>${t.category}</td>
            <td style="color: ${amountColor}; font-weight: bold;">
                ${amountSign} LKR ${t.amount.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-outline-danger" onclick="deleteTransaction(${t.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    }
}

function deleteTransaction(id) {
    let confirmDelete = confirm("🗑️ Are you sure you want to delete this transaction?\n\nThis action cannot be undone.");
    
    if (confirmDelete) {
        let deletedDescription = "";
        let deletedAmount = 0;
        
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].id === id) {
                deletedDescription = transactions[i].description;
                deletedAmount = transactions[i].amount;
                break;
            }
        }

        let newTransactions = [];
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].id !== id) {
                newTransactions.push(transactions[i]);
            }
        }
        transactions = newTransactions;

        saveTransactions();
        renderTable();
        calculateTotals();

        alert("✅ Transaction deleted successfully!\n\n" +
              "Deleted: " + deletedDescription + "\n" +
              "Amount: LKR " + deletedAmount.toFixed(2));
    } else {
        alert("❌ Delete cancelled. Transaction was not removed.");
    }
}

function calculateTotals() {
    let income = 0;
    let expenses = 0;

    for (let i = 0; i < transactions.length; i++) {
        let t = transactions[i];
        if (t.type === 'Income') {
            income = income + t.amount;
        } else {
            expenses = expenses + t.amount;
        }
    }

    let balance = income - expenses;

    totalIncomeEl.innerHTML = 'LKR ' + income.toFixed(2);
    totalExpensesEl.innerHTML = 'LKR ' + expenses.toFixed(2);
    currentBalanceEl.innerHTML = 'LKR ' + balance.toFixed(2);
}

filterSelect.addEventListener('change', function() {
    let selectedFilter = filterSelect.value;
    renderTable();

    if (selectedFilter === 'All') {
        alert("📋 Showing ALL transactions.");
    } else if (selectedFilter === 'Income') {
        alert("💰 Showing INCOME transactions only.");
    } else if (selectedFilter === 'Expense') {
        alert("💸 Showing EXPENSE transactions only.");
    }
});

const clearBtn = document.querySelector('button[type="reset"]');
if (clearBtn) {
    clearBtn.addEventListener('click', function() {
        alert("🧹 Form cleared. All fields have been reset.");
    });
}

alert("🚀 Personal Expense Tracker is starting...");
loadTransactions();