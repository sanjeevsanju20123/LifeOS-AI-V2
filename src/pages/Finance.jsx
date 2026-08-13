import React, { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Finance() {
  const {
    income,
    expenses,
    balance,
    savingsRate,
    transactions,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");

  // Current date
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [date, setDate] = useState(today);

  // ==========================================
  // FINANCE PERIOD FILTER
  // ==========================================

  const [filter, setFilter] = useState("today");

  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const transactionDate =
        new Date(transaction.date);

      if (filter === "today") {
        return (
          transactionDate.getFullYear() ===
            now.getFullYear() &&
          transactionDate.getMonth() ===
            now.getMonth() &&
          transactionDate.getDate() ===
            now.getDate()
        );
      }

      if (filter === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(
          now.getDate() - now.getDay()
        );
        startOfWeek.setHours(0, 0, 0, 0);

        return transactionDate >= startOfWeek;
      }

      if (filter === "month") {
        return (
          transactionDate.getFullYear() ===
            now.getFullYear() &&
          transactionDate.getMonth() ===
            now.getMonth()
        );
      }

      return true;
    });
  }, [transactions, filter]);

  // ==========================================
  // FILTERED INCOME / EXPENSES
  // ==========================================

  const filteredIncome = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );
  }, [filteredTransactions]);

  const filteredExpenses = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );
  }, [filteredTransactions]);

  // ==========================================
  // MONTHLY FINANCE DASHBOARD
  // ==========================================

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const transactionDate =
        new Date(transaction.date);

      return (
        transactionDate.getMonth() ===
          now.getMonth() &&
        transactionDate.getFullYear() ===
          now.getFullYear()
      );
    });
  }, [transactions]);

  const monthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );
  }, [currentMonthTransactions]);

  const monthlyExpenses = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );
  }, [currentMonthTransactions]);

  const monthlySavings =
    monthlyIncome - monthlyExpenses;

  const monthlySavingsRate = useMemo(() => {
    if (monthlyIncome <= 0) return 0;

    return Math.round(
      (monthlySavings / monthlyIncome) * 100
    );
  }, [monthlyIncome, monthlySavings]);

  const currentMonthName =
    new Date().toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

  // ==========================================
  // SIX MONTH FINANCE CHART
  // ==========================================

  const monthlyChartData = useMemo(() => {
    const months = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      let monthIncome = 0;
      let monthExpenses = 0;

      transactions.forEach((transaction) => {
        if (!transaction.date) return;

        const transactionDate =
          new Date(transaction.date);

        if (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        ) {
          if (
            transaction.type === "income"
          ) {
            monthIncome += Number(
              transaction.amount || 0
            );
          }

          if (
            transaction.type === "expense"
          ) {
            monthExpenses += Number(
              transaction.amount || 0
            );
          }
        }
      });

      months.push({
        name: date.toLocaleDateString(
          "en-IN",
          {
            month: "short",
          }
        ),
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    return months;
  }, [transactions]);

  // ==========================================
  // EXPENSE CATEGORY DATA
  // ==========================================

  const categoryChartData = useMemo(() => {
    const categoryMap = {};

    filteredTransactions.forEach(
      (transaction) => {
        if (
          transaction.type !== "expense"
        ) {
          return;
        }

        const category =
          transaction.category || "Other";

        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }

        categoryMap[category] += Number(
          transaction.amount || 0
        );
      }
    );

    return Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );
  }, [filteredTransactions]);

  // ==========================================
  // ADD TRANSACTION
  // ==========================================

  function handleSubmit(e) {
    e.preventDefault();

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      return;
    }

    addTransaction({
      type,
      amount,
      category,
      description,
      date,
    });

    setAmount("");
    setDescription("");
    setDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );
  }

  // ==========================================
  // FILTER LABEL
  // ==========================================

  const filterLabel =
    filter === "today"
      ? "Today"
      : filter === "week"
      ? "This Week"
      : filter === "month"
      ? "This Month"
      : "All Time";

  return (
    <section className="finance-page">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="finance-header">
        <h1>Finance</h1>

        <p>
          Track your money, savings and
          financial growth
        </p>
      </div>


      {/* ================================= */}
      {/* PERIOD FILTER */}
      {/* ================================= */}

      <div className="finance-period">

        <span>
          📅 Finance Period
        </span>

        <div className="finance-period-buttons">

          <button
            type="button"
            className={
              filter === "today"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("today")
            }
          >
            Today
          </button>

          <button
            type="button"
            className={
              filter === "week"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("week")
            }
          >
            This Week
          </button>

          <button
            type="button"
            className={
              filter === "month"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("month")
            }
          >
            This Month
          </button>

          <button
            type="button"
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All Time
          </button>

        </div>
      </div>


      {/* ================================= */}
      {/* FINANCIAL OVERVIEW */}
      {/* ================================= */}

      <div className="finance-grid">

        <div className="finance-card">
          <span>
            💰 Net Worth
          </span>

          <h2>
            ₹{balance.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>

        <div className="finance-card">
          <span>
            📈 Income
          </span>

          <h2>
            ₹{income.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>

        <div className="finance-card">
          <span>
            💸 Expenses
          </span>

          <h2>
            ₹{expenses.toLocaleString(
              "en-IN"
            )}
          </h2>
        </div>

        <div className="finance-card">
          <span>
            🎯 Savings
          </span>

          <h2>
            {savingsRate}%
          </h2>
        </div>

      </div>


      {/* ================================= */}
      {/* MONTHLY FINANCE DASHBOARD */}
      {/* ================================= */}

      <div className="monthly-finance-dashboard">

        <div className="monthly-finance-header">

          <div>
            <span className="monthly-finance-label">
              📅 Monthly Overview
            </span>

            <h2>
              {currentMonthName}
            </h2>
          </div>

          <div className="monthly-savings-badge">
            🎯 {monthlySavingsRate}% Saved
          </div>

        </div>


        <div className="monthly-finance-grid">

          <div className="monthly-finance-card income">

            <span>
              📈 Monthly Income
            </span>

            <strong>
              ₹{monthlyIncome.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          <div className="monthly-finance-card expense">

            <span>
              💸 Monthly Expenses
            </span>

            <strong>
              ₹{monthlyExpenses.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>


          <div className="monthly-finance-card savings">

            <span>
              💰 Monthly Savings
            </span>

            <strong>
              ₹{monthlySavings.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* ================================= */}
      {/* FINANCE ANALYTICS */}
      {/* ================================= */}

      <div className="finance-section">

        <div className="finance-chart-header">

          <h2>
            📊 Finance Analytics
          </h2>

          <p className="finance-chart-subtitle">
            Income vs expenses — last 6 months
          </p>

        </div>


        <div className="finance-chart">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={monthlyChartData}
              margin={{
                top: 20,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                stroke="var(--text-muted)"
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="var(--text-muted)"
                allowDecimals={false}
              />

              <Tooltip
  cursor={false}
  formatter={(value, name) => [
    `₹${Number(value).toLocaleString("en-IN")}`,
    name === "income"
      ? "Income"
      : "Expenses",
  ]}
  contentStyle={{
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--text)",
  }}
/>

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                  activeBar={false}
                   radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  maxBarSize={45}
                />

              <Bar
               dataKey="expenses"
                name="Expenses"
                fill="#ef4444"
                activeBar={false}
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
                maxBarSize={45}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* ================================= */}
      {/* EXPENSE CATEGORIES */}
      {/* ================================= */}

      <div className="finance-section">

        <div className="finance-chart-header">

          <h2>
            🥧 Expense Categories
          </h2>

          <p className="finance-chart-subtitle">
            Where your money is going —{" "}
            {filterLabel}
          </p>

        </div>


        {categoryChartData.length === 0 ? (

          <p className="finance-empty">
            No expense data for this
            period.
          </p>

        ) : (

          <div className="finance-category-list">

            {categoryChartData.map(
              (item) => {

                const percentage =
                  filteredExpenses > 0
                    ? Math.round(
                        (item.amount /
                          filteredExpenses) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="finance-category-item"
                    key={item.name}
                  >

                    <div className="finance-category-top">

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        ₹
                        {item.amount.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div className="finance-progress">

                      <div
                        className="finance-progress-fill"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>


                    <small>
                      {percentage}% of
                      expenses
                    </small>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>


      {/* ================================= */}
      {/* ADD TRANSACTION */}
      {/* ================================= */}

      <div className="finance-section">

        <h2>
          Add Transaction
        </h2>

        <form
          className="finance-form"
          onSubmit={handleSubmit}
        >

          <div className="finance-type-buttons">

            <button
              type="button"
              className={
                type === "expense"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("expense")
              }
            >
              💸 Expense
            </button>


            <button
              type="button"
              className={
                type === "income"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setType("income")
              }
            >
              📈 Income
            </button>

          </div>


          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            min="1"
          />


          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />


          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >

            <option>
              Food
            </option>

            <option>
              Travel
            </option>

            <option>
              Bills
            </option>

            <option>
              Shopping
            </option>

            <option>
              Entertainment
            </option>

            <option>
              Health
            </option>

            <option>
              Salary
            </option>

            <option>
              Business
            </option>

            <option>
              Investment
            </option>

            <option>
              Other
            </option>

          </select>


          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />


          <button
            type="submit"
            className="finance-add-button"
          >
            + Add Transaction
          </button>

        </form>

      </div>


      {/* ================================= */}
      {/* RECENT TRANSACTIONS */}
      {/* ================================= */}

      <div className="finance-section">

        <h2>
          Recent Transactions
        </h2>

        {filteredTransactions.length ===
        0 ? (

          <p className="finance-empty">
            No transactions for{" "}
            {filterLabel.toLowerCase()}.
          </p>

        ) : (

          <div className="transaction-list">

            {[...filteredTransactions]
              .reverse()
              .map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={
                      transaction.id
                    }
                  >

                    <div>

                      <strong>
                        {
                          transaction.category
                        }
                      </strong>

                      <p>
                        {
                          transaction.description ||
                          "No description"
                        }
                      </p>

                      <small className="transaction-date">

                        {transaction.date
                          ? new Date(
                              transaction.date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day:
                                  "2-digit",
                                month:
                                  "short",
                                year:
                                  "numeric",
                              }
                            )
                          : "No date"}

                      </small>

                    </div>


                    <div className="transaction-right">

                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "income-text"
                            : "expense-text"
                        }
                      >

                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}

                        ₹
                        {Number(
                          transaction.amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </strong>


                      <button
                        type="button"
                        className="transaction-delete"
                        onClick={() =>
                          deleteTransaction(
                            transaction.id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>

                  </div>

                )
              )}

          </div>

        )}

      </div>


      {/* ================================= */}
      {/* ARES FINANCE INSIGHT */}
      {/* ================================= */}

      <div className="finance-insight">

        🧠 ARES Finance Insight

        <p>

          {filteredTransactions.length ===
          0
            ? "Add a transaction to unlock financial insights."
            : `You have recorded ${
                filteredTransactions.length
              } transaction${
                filteredTransactions.length ===
                1
                  ? ""
                  : "s"
              } in this period.`}

        </p>

      </div>

    </section>
  );
}