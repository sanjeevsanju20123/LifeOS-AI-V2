import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FinanceContext = createContext();

const STORAGE_KEY = "lifeos-finance";

const DEFAULT_STATE = {
  transactions: [],
  monthlyBudget: 0,
};

function loadFinance() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(saved);

    return {
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
      monthlyBudget: Number(parsed.monthlyBudget) || 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function FinanceProvider({ children }) {
  const [finance, setFinance] = useState(loadFinance);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(finance)
      );
    } catch {
      // Ignore storage errors
    }
  }, [finance]);

  function addTransaction({
    type,
    amount,
    category,
    description = "",
    date = new Date().toISOString().slice(0, 10),
  }) {
    const transaction = {
      id: Date.now(),
      type,
      amount: Number(amount),
      category,
      description,
      date,
    };

    setFinance((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        transaction,
      ],
    }));
  }

  function deleteTransaction(id) {
    setFinance((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(
        (transaction) =>
          transaction.id !== id
      ),
    }));
  }

  const income = useMemo(() => {
    return finance.transactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [finance.transactions]);

  const expenses = useMemo(() => {
    return finance.transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [finance.transactions]);

  const balance = income - expenses;

  const savingsRate = useMemo(() => {
    if (income <= 0) {
      return 0;
    }

    return Math.round(
      (balance / income) * 100
    );
  }, [income, balance]);

  const monthlyTransactions = useMemo(() => {
    const now = new Date();

    return finance.transactions.filter(
      (transaction) => {
        if (!transaction.date) {
          return false;
        }

        const transactionDate =
          new Date(transaction.date);

        return (
          transactionDate.getMonth() ===
            now.getMonth() &&
          transactionDate.getFullYear() ===
            now.getFullYear()
        );
      }
    );
  }, [finance.transactions]);

  const monthlyIncome = useMemo(() => {
    return monthlyTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [monthlyTransactions]);

  const monthlyExpenses = useMemo(() => {
    return monthlyTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }, [monthlyTransactions]);

  const monthlyBudget = Number(
    finance.monthlyBudget || 0
  );

  const budgetRemaining =
    monthlyBudget - monthlyExpenses;

  const budgetUsedPercentage = useMemo(() => {
    if (monthlyBudget <= 0) {
      return 0;
    }

    return Math.round(
      (monthlyExpenses / monthlyBudget) * 100
    );
  }, [monthlyBudget, monthlyExpenses]);

  const budgetExceeded =
    monthlyBudget > 0 &&
    monthlyExpenses > monthlyBudget;

  function setMonthlyBudget(amount) {
    const budget = Number(amount);

    setFinance((prev) => ({
      ...prev,
      monthlyBudget:
        Number.isFinite(budget) && budget >= 0
          ? budget
          : 0,
    }));
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions: finance.transactions,

        income,
        expenses,
        balance,
        savingsRate,

        monthlyBudget,
        monthlyIncome,
        monthlyExpenses,
        budgetRemaining,
        budgetUsedPercentage,
        budgetExceeded,

        addTransaction,
        deleteTransaction,
        setMonthlyBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}