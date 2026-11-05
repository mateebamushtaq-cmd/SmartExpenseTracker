
const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const description = document.getElementById("description").value;

    const expense = {
        category: category,
        amount: amount,
        description: description
    };

    try {
        const response = await fetch("/api/expenses", {
            method: "POST",
           
headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + sessionStorage.getItem("expenseToken")
},

            body: JSON.stringify(expense)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to add expense");
            return;
        }

        alert("Expense added successfully!");
        expenseForm.reset();
loadExpenses();
    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
});

async function loadExpenses() {
    const expenseList = document.getElementById("expenseList");

    try {
        
        const response = await fetch("/api/expenses", {
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("expenseToken")
            }
        });


        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        const expenses = await response.json();
        
const reportMonth = document.getElementById("reportMonth");
const monthlyTotal = document.getElementById("monthlyTotal");

if (!reportMonth.value) {
    const today = new Date();
    reportMonth.value =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0");
}

function updateMonthlyReport() {
    let total = 0;

    expenses.forEach(function(expense) {
        if (expense.date &&
            expense.date.startsWith(reportMonth.value)) {
            total += expense.amount;
        }
    });

    monthlyTotal.textContent =
        "Monthly Total: Rs. " + total.toFixed(2);
}

reportMonth.onchange = updateMonthlyReport;
updateMonthlyReport();

let total = 0;

expenses.forEach(function(expense) {
    total += expense.amount;
});

document.getElementById("totalAmount").textContent =
    "Rs. " + total.toFixed(2);

const categoryTotals = {};

expenses.forEach(function(expense) {
    const category = expense.category.trim().toLowerCase();

    if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
    }

    categoryTotals[category] += expense.amount;
});

const categorySummary = document.getElementById("categorySummary");
categorySummary.innerHTML = "";

for (const category in categoryTotals) {
    const item = document.createElement("p");

    item.textContent =
        category + ": Rs. " + categoryTotals[category].toFixed(2);

    categorySummary.appendChild(item);
}

const chartCanvas = document.getElementById("expenseChart");

if (window.expenseChartInstance) {
    window.expenseChartInstance.destroy();
}

window.expenseChartInstance = new Chart(chartCanvas, {
    type: "bar",
    data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
            label: "Spending (Rs.)",
            data: Object.values(categoryTotals),
            backgroundColor: "#2563eb",
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


        expenseList.innerHTML = "";

        if (expenses.length === 0) {
            expenseList.textContent = "No expenses added yet.";
            return;
        }

const filterDate = document.getElementById("filterDate");
const clearDateFilter = document.getElementById("clearDateFilter");

const selectedDate = filterDate.value;

const filteredExpenses = selectedDate
    ? expenses.filter(function(expense) {
        return expense.date === selectedDate;
    })
    : expenses;

clearDateFilter.onclick = function() {
    filterDate.value = "";
    loadExpenses();
};

filterDate.onchange = loadExpenses;

        filteredExpenses.forEach(function(expense) {            const item = document.createElement("div");

            const category = document.createElement("strong");
            category.textContent = expense.category;

            const details = document.createElement("p");
            details.textContent =
                "Amount: Rs. " + expense.amount +
                " | Description: " + (expense.description || "None");
                const dateText = document.createElement("p");
dateText.textContent = "Date: " + (expense.date || "Not recorded");

const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.type = "button";
editButton.classList.add("edit-btn");
editButton.addEventListener("click", async function() {
    const newAmount = prompt(
        "Enter the new amount:",
        expense.amount
    );

    if (newAmount === null) {
        return;
    }

    const amount = Number(newAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid positive amount.");
        return;
    }

    try {
        const response = await fetch("/api/expenses/" + expense.id, {
            method: "PUT",
            
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + sessionStorage.getItem("expenseToken")
            },

            body: JSON.stringify({ amount: amount })
        });

        if (!response.ok) {
            throw new Error("Failed to update expense");
        }

        alert("Expense updated successfully!");
        loadExpenses();

    } catch (error) {
        alert("Unable to update expense.");
        console.error(error);
    }
});


const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete";
deleteButton.type = "button";
deleteButton.classList.add("delete-btn");

deleteButton.addEventListener("click", async function() {
    const confirmed = confirm("Are you sure you want to delete this expense?");

    if (!confirmed) {
        return;
    }

    try {
       
const response = await fetch("/api/expenses/" + expense.id, {
    method: "DELETE",
    headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("expenseToken")
    }
});


        if (!response.ok) {
            throw new Error("Failed to delete expense");
        }

        alert("Expense deleted successfully!");
        loadExpenses();

    } catch (error) {
        alert("Unable to delete expense.");
        console.error(error);
    }
});

// Your existing code continues below
item.appendChild(category);
item.appendChild(details);
item.appendChild(dateText);
item.appendChild(editButton);
item.appendChild(deleteButton);
expenseList.appendChild(item);

            item.appendChild(category);
            item.appendChild(details);
            item.appendChild(deleteButton);
            expenseList.appendChild(item);
        });

    } catch (error) {
        expenseList.textContent = "Unable to load expenses.";
        console.error(error);
    }
}

loadExpenses();

const checkBudgetButton = document.getElementById("checkBudget");

checkBudgetButton.addEventListener("click", async function() {
    const budget = Number(document.getElementById("budgetAmount").value);
    const budgetMessage = document.getElementById("budgetMessage");
    const selectedMonth = document.getElementById("reportMonth").value;

    if (!Number.isFinite(budget) || budget <= 0) {
        budgetMessage.textContent = "Please enter a valid budget.";
        return;
    }

    try {
        const response = await fetch("/api/expenses");

        if (!response.ok) {
            throw new Error("Unable to retrieve expenses");
        }

        const expenses = await response.json();
        let monthlySpending = 0;

        expenses.forEach(function(expense) {
            if (expense.date && expense.date.startsWith(selectedMonth)) {
                monthlySpending += expense.amount;
            }
        });

        if (monthlySpending > budget) {
            budgetMessage.textContent =
                "Warning! Budget exceeded by Rs. " +
                (monthlySpending - budget).toFixed(2);
            budgetMessage.style.color = "red";
        } else {
            budgetMessage.textContent =
                "Within budget! Remaining: Rs. " +
                (budget - monthlySpending).toFixed(2);
            budgetMessage.style.color = "green";
        }

    } catch (error) {
        budgetMessage.textContent = "Unable to check budget.";
        budgetMessage.style.color = "red";
        console.error(error);
    }
});

const exportButton = document.getElementById("exportCSV");

exportButton.addEventListener("click", async function() {
    try {
        const response = await fetch("/api/expenses");

        if (!response.ok) {
            throw new Error("Unable to retrieve expenses");
        }

        const expenses = await response.json();

        if (expenses.length === 0) {
            alert("No expenses available to export.");
            return;
        }

        const escapeCSV = function(value) {
            const text = String(value ?? "");
            return '"' + text.replace(/"/g, '""') + '"';
        };

        const rows = [
            ["Category", "Amount", "Description", "Date"],
            ...expenses.map(function(expense) {
                return [
                    expense.category,
                    expense.amount,
                    expense.description,
                    expense.date
                ];
            })
        ];

        const csv = rows
            .map(function(row) {
                return row.map(escapeCSV).join(",");
            })
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "expenses.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

    } catch (error) {
        alert("Unable to export expenses.");
        console.error(error);
    }
});

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("expenseToken", data.token);
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";
        } else {
            loginMessage.textContent = data.error || "Login failed";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        loginMessage.textContent = "Cannot connect to the server";
        loginMessage.style.color = "red";
    }
});
