"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";

type AccountType =
  | "cash"
  | "bank"
  | "wallet"
  | "credit_card"
  | "other";

type TransactionType = "income" | "expense";

type TransactionFilter = "all" | TransactionType;

interface FinanceAccount {
  id: string;
  name: string;
  account_type: AccountType;
  balance: string | number;
  description: string | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AccountResponse {
  items: FinanceAccount[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface FinanceTransaction {
  id: string;
  account_id: string;
  transaction_type: TransactionType;
  title: string;
  amount: string | number;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

interface TransactionResponse {
  items: FinanceTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface FinanceSummary {
  total_income: string | number;
  total_expense: string | number;
  net_balance: string | number;
}

const accountTypes: {
  value: AccountType;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Account" },
  { value: "wallet", label: "Wallet" },
  { value: "credit_card", label: "Credit Card" },
  { value: "other", label: "Other" },
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Rent",
  "Other",
];

function formatMoney(value: string | number) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getAccountIcon(type: AccountType) {
  switch (type) {
    case "cash":
      return "₹";
    case "bank":
      return "🏦";
    case "wallet":
      return "👛";
    case "credit_card":
      return "💳";
    default:
      return "💰";
  }
}

function getAccountTypeLabel(type: AccountType) {
  return (
    accountTypes.find((item) => item.value === type)?.label ??
    "Other"
  );
}

export default function FinancePage() {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [transactions, setTransactions] = useState<
    FinanceTransaction[]
  >([]);

  const [totalBalance, setTotalBalance] = useState(0);

  const [summary, setSummary] = useState<FinanceSummary>({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  const [showAccountForm, setShowAccountForm] =
    useState(false);

  const [showTransactionForm, setShowTransactionForm] =
    useState(false);

  const [editingAccount, setEditingAccount] =
    useState<FinanceAccount | null>(null);

  const [editingTransaction, setEditingTransaction] =
    useState<FinanceTransaction | null>(null);

  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");

  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");

  // Account form
  const [name, setName] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>("cash");
  const [balance, setBalance] = useState("");
  const [description, setDescription] = useState("");

  // Transaction form
  const [transactionTitle, setTransactionTitle] =
    useState("");

  const [transactionAmount, setTransactionAmount] =
    useState("");

  const [transactionCategory, setTransactionCategory] =
    useState("Food");

  const [transactionAccount, setTransactionAccount] =
    useState("");

  const [transactionDescription, setTransactionDescription] =
    useState("");

  const [transactionDate, setTransactionDate] =
    useState(getToday());

  const loadFinance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        accountsResponse,
        balanceResponse,
        transactionsResponse,
        summaryResponse,
      ] = await Promise.all([
        api.get<AccountResponse>("/finance/accounts"),

        api.get<{ total_balance: string | number }>(
          "/finance/accounts/summary/balance"
        ),

        api.get<TransactionResponse>(
          "/finance/transactions?page=1&page_size=100"
        ),

        api.get<FinanceSummary>(
          "/finance/transactions/summary"
        ),
      ]);

      setAccounts(accountsResponse.items);

      setTotalBalance(
        Number(balanceResponse.total_balance || 0)
      );

      setTransactions(transactionsResponse.items);

      setSummary(summaryResponse);

      setTransactionAccount((current) => {
        if (
          current &&
          accountsResponse.items.some(
            (account) => account.id === current
          )
        ) {
          return current;
        }

        return accountsResponse.items[0]?.id ?? "";
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load finance data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  function closeAllForms() {
    setShowAccountForm(false);
    setShowTransactionForm(false);
  }

  function resetAccountForm() {
    setName("");
    setAccountType("cash");
    setBalance("");
    setDescription("");
    setEditingAccount(null);
    setShowAccountForm(false);
  }

  function resetTransactionForm() {
    setTransactionTitle("");
    setTransactionAmount("");
    setTransactionCategory("Food");
    setTransactionDescription("");
    setTransactionDate(getToday());
    setEditingTransaction(null);
    setTransactionType("expense");
    setTransactionAccount(accounts[0]?.id ?? "");
    setShowTransactionForm(false);
  }

  function openAddAccount() {
    closeAllForms();
    setEditingAccount(null);
    setName("");
    setAccountType("cash");
    setBalance("");
    setDescription("");
    setError(null);
    setShowAccountForm(true);
  }

  function openEditAccount(account: FinanceAccount) {
    closeAllForms();

    setEditingAccount(account);
    setName(account.name);
    setAccountType(account.account_type);
    setBalance(String(account.balance));
    setDescription(account.description ?? "");
    setError(null);

    setShowAccountForm(true);
  }

  function openTransactionForm(
    type: TransactionType
  ) {
    closeAllForms();

    setEditingTransaction(null);
    setTransactionType(type);

    setTransactionTitle("");
    setTransactionAmount("");
    setTransactionDescription("");
    setTransactionDate(getToday());

    setTransactionCategory(
      type === "income" ? "Salary" : "Food"
    );

    setTransactionAccount(
      accounts[0]?.id ?? ""
    );

    setError(null);
    setShowTransactionForm(true);
  }

  function openEditTransaction(
    transaction: FinanceTransaction
  ) {
    closeAllForms();

    setEditingTransaction(transaction);

    setTransactionType(
      transaction.transaction_type
    );

    setTransactionTitle(transaction.title);

    setTransactionAmount(
      String(transaction.amount)
    );

    setTransactionCategory(transaction.category);

    setTransactionAccount(
      transaction.account_id
    );

    setTransactionDescription(
      transaction.description ?? ""
    );

    setTransactionDate(
      transaction.transaction_date
    );

    setError(null);
    setShowTransactionForm(true);
  }

  async function handleAccountSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Account name is required.");
      return;
    }

    const numericBalance = Number(balance || 0);

    if (!Number.isFinite(numericBalance)) {
      setError("Enter a valid account balance.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: trimmedName,
        account_type: accountType,
        balance: numericBalance,
        description: description.trim() || null,
        currency: "INR",
      };

      if (editingAccount) {
        await api.put(
          `/finance/accounts/${editingAccount.id}`,
          payload
        );
      } else {
        await api.post(
          "/finance/accounts",
          payload
        );
      }

      resetAccountForm();
      await loadFinance();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to save account."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(
    account: FinanceAccount
  ) {
    const confirmed = window.confirm(
      `Delete "${account.name}"? This will deactivate the account.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(account.id);
      setError(null);

      await api.delete(
        `/finance/accounts/${account.id}`
      );

      await loadFinance();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete account."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTransactionSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedTitle =
      transactionTitle.trim();

    const numericAmount =
      Number(transactionAmount);

    if (!trimmedTitle) {
      setError("Transaction title is required.");
      return;
    }

    if (
      !transactionAmount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        "Enter a valid transaction amount greater than zero."
      );
      return;
    }

    if (!transactionAccount) {
      setError("Please select an account.");
      return;
    }

    if (!transactionCategory) {
      setError("Please select a category.");
      return;
    }

    if (!transactionDate) {
      setError("Transaction date is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        account_id: transactionAccount,
        transaction_type: transactionType,
        title: trimmedTitle,
        amount: numericAmount,
        category: transactionCategory,
        description:
          transactionDescription.trim() || null,
        transaction_date: transactionDate,
      };

      if (editingTransaction) {
        await api.put(
          `/finance/transactions/${editingTransaction.id}`,
          payload
        );
      } else {
        await api.post(
          "/finance/transactions",
          payload
        );
      }

      resetTransactionForm();

      await loadFinance();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTransaction(
    transaction: FinanceTransaction
  ) {
    const confirmed = window.confirm(
      `Delete "${transaction.title}"? The account balance will be adjusted automatically.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(transaction.id);
      setError(null);

      await api.delete(
        `/finance/transactions/${transaction.id}`
      );

      await loadFinance();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete transaction."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const visibleTransactions = useMemo(() => {
    if (transactionFilter === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.transaction_type ===
        transactionFilter
    );
  }, [transactions, transactionFilter]);

  const transactionCategories =
    transactionType === "income"
      ? incomeCategories
      : expenseCategories;

  const savingsRate =
    Number(summary.total_income) > 0
      ? Math.max(
          0,
          (Number(summary.net_balance) /
            Number(summary.total_income)) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="text-muted hover:text-foreground transition"
            >
              ← Dashboard
            </Link>

            <span className="text-border">
              /
            </span>

            <span className="font-semibold">
              Finance
            </span>
          </div>

          <Link
            href="/app/settings"
            className="text-sm text-muted hover:text-foreground transition"
          >
            Settings
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>LifeOS</span>
              <span>/</span>
              <span>Finance</span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Finance
            </h1>

            <p className="mt-2 text-muted max-w-2xl">
              Manage your accounts, income, expenses and
              overall financial activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                openTransactionForm("expense")
              }
              disabled={accounts.length === 0}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + Expense
            </button>

            <button
              type="button"
              onClick={() =>
                openTransactionForm("income")
              }
              disabled={accounts.length === 0}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + Income
            </button>

            <button
              type="button"
              onClick={openAddAccount}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/20 transition"
            >
              + Account
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-start justify-between gap-4"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Financial overview */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border rounded-xl bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Total Balance
              </p>

              <span className="text-xl">
                💰
              </span>
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(totalBalance)}
            </p>

            <p className="mt-2 text-xs text-muted">
              Across active accounts
            </p>
          </div>

          <div className="border border-border rounded-xl bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Income
              </p>

              <span className="text-xl">
                ↗
              </span>
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(summary.total_income)}
            </p>

            <p className="mt-2 text-xs text-muted">
              Total recorded income
            </p>
          </div>

          <div className="border border-border rounded-xl bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Expenses
              </p>

              <span className="text-xl">
                ↘
              </span>
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(summary.total_expense)}
            </p>

            <p className="mt-2 text-xs text-muted">
              Total recorded expenses
            </p>
          </div>

          <div className="border border-border rounded-xl bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Net Position
              </p>

              <span className="text-xl">
                📊
              </span>
            </div>

            <p className="mt-3 text-2xl font-semibold">
              {formatMoney(summary.net_balance)}
            </p>

            <p className="mt-2 text-xs text-muted">
              Income minus expenses
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section className="mt-8 border border-border rounded-xl bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Financial Overview
              </h2>

              <p className="mt-1 text-sm text-muted">
                A quick view of your recorded financial activity.
              </p>
            </div>

            <span className="text-sm text-muted">
              {transactions.length} transaction
              {transactions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                Income vs Expenses
              </span>

              <span className="font-medium">
                {savingsRate.toFixed(1)}% net
              </span>
            </div>

            <div className="mt-3 h-3 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, savingsRate)
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs text-muted">
              <span>
                Income:{" "}
                <strong className="text-foreground">
                  {formatMoney(summary.total_income)}
                </strong>
              </span>

              <span>
                Expenses:{" "}
                <strong className="text-foreground">
                  {formatMoney(summary.total_expense)}
                </strong>
              </span>

              <span>
                Net:{" "}
                <strong className="text-foreground">
                  {formatMoney(summary.net_balance)}
                </strong>
              </span>
            </div>
          </div>
        </section>

        {/* Transaction form */}
        {showTransactionForm && (
          <section className="mt-8">
            <div className="border border-border rounded-xl bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {transactionType === "income"
                        ? "💰"
                        : "💸"}
                    </span>

                    <h2 className="text-lg font-semibold">
                      {editingTransaction
                        ? "Edit Transaction"
                        : transactionType === "income"
                        ? "Add Income"
                        : "Add Expense"}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-muted">
                    {editingTransaction
                      ? "Update the transaction details below."
                      : "Record a financial transaction and automatically update the account balance."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetTransactionForm}
                  className="text-muted hover:text-foreground"
                  aria-label="Close transaction form"
                >
                  ✕
                </button>
              </div>

              {/* Type selector */}
              <div className="mt-6 inline-flex rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("income");
                    setTransactionCategory("Salary");
                  }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    transactionType === "income"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/20"
                  }`}
                >
                  Income
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("expense");
                    setTransactionCategory("Food");
                  }}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    transactionType === "expense"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/20"
                  }`}
                >
                  Expense
                </button>
              </div>

              <form
                onSubmit={handleTransactionSubmit}
                className="mt-6 grid gap-5 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>

                  <input
                    value={transactionTitle}
                    onChange={(event) =>
                      setTransactionTitle(
                        event.target.value
                      )
                    }
                    placeholder={
                      transactionType === "income"
                        ? "September Salary"
                        : "Grocery Shopping"
                    }
                    maxLength={255}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                      ₹
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={transactionAmount}
                      onChange={(event) =>
                        setTransactionAmount(
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      required
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-3 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account
                  </label>

                  <select
                    value={transactionAccount}
                    onChange={(event) =>
                      setTransactionAccount(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.name} —{" "}
                        {formatMoney(account.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <select
                    value={transactionCategory}
                    onChange={(event) =>
                      setTransactionCategory(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  >
                    {transactionCategories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(event) =>
                      setTransactionDate(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Currency
                  </label>

                  <input
                    value="INR (₹)"
                    disabled
                    className="w-full rounded-lg border border-border bg-muted/20 px-4 py-3 text-muted"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>

                  <textarea
                    value={transactionDescription}
                    onChange={(event) =>
                      setTransactionDescription(
                        event.target.value
                      )
                    }
                    placeholder="Optional description..."
                    maxLength={10000}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none transition"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={resetTransactionForm}
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted/20 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || accounts.length === 0}
                    className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {saving
                      ? "Saving..."
                      : editingTransaction
                      ? "Update Transaction"
                      : `Save ${
                          transactionType === "income"
                            ? "Income"
                            : "Expense"
                        }`}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Account form */}
        {showAccountForm && (
          <section className="mt-8">
            <div className="border border-border rounded-xl bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      🏦
                    </span>

                    <h2 className="text-lg font-semibold">
                      {editingAccount
                        ? "Edit Account"
                        : "Add Account"}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-muted">
                    Manage a bank account, cash balance,
                    wallet or card.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="text-muted hover:text-foreground"
                  aria-label="Close account form"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleAccountSubmit}
                className="mt-6 grid gap-5 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Name
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="e.g. HDFC Bank"
                    maxLength={255}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Type
                  </label>

                  <select
                    value={accountType}
                    onChange={(event) =>
                      setAccountType(
                        event.target.value as AccountType
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary transition"
                  >
                    {accountTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Balance
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                      ₹
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(event) =>
                        setBalance(event.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-3 outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Currency
                  </label>

                  <input
                    value="INR (₹)"
                    disabled
                    className="w-full rounded-lg border border-border bg-muted/20 px-4 py-3 text-muted"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Optional description..."
                    maxLength={10000}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none transition"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={resetAccountForm}
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted/20 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {saving
                      ? "Saving..."
                      : editingAccount
                      ? "Update Account"
                      : "Save Account"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Accounts */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Accounts
              </h2>

              <p className="mt-1 text-sm text-muted">
                Your active money accounts.
              </p>
            </div>

            <span className="text-sm text-muted">
              {accounts.length} account
              {accounts.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="mt-5 border border-border rounded-xl p-10 text-center text-muted">
              Loading finance data...
            </div>
          ) : accounts.length === 0 ? (
            <div className="mt-5 border border-dashed border-border rounded-xl p-10 text-center">
              <div className="text-4xl">
                💰
              </div>

              <h3 className="mt-4 font-medium">
                No accounts yet
              </h3>

              <p className="mt-2 text-sm text-muted max-w-md mx-auto">
                Add your first account before recording
                income or expenses.
              </p>

              <button
                type="button"
                onClick={openAddAccount}
                className="mt-5 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
              >
                + Add Your First Account
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-border rounded-xl bg-surface p-5 hover:border-primary/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-lg border border-border flex items-center justify-center text-xl">
                        {getAccountIcon(
                          account.account_type
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">
                          {account.name}
                        </h3>

                        <p className="text-xs text-muted mt-1">
                          {getAccountTypeLabel(
                            account.account_type
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs text-muted">
                      Current Balance
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {formatMoney(account.balance)}
                    </p>
                  </div>

                  {account.description && (
                    <p className="mt-3 text-sm text-muted line-clamp-2">
                      {account.description}
                    </p>
                  )}

                  <div className="mt-5 pt-4 border-t border-border flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditAccount(account)
                      }
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/20 transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAccount(account)
                      }
                      disabled={
                        deletingId === account.id
                      }
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition"
                    >
                      {deletingId === account.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Transactions */}
        <section className="mt-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-muted">
                Review and manage your income and expenses.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-lg border border-border p-1">
              {(
                ["all", "income", "expense"] as const
              ).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setTransactionFilter(filter)
                  }
                  className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
                    transactionFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/20"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-5 border border-border rounded-xl p-10 text-center text-muted">
              Loading transactions...
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="mt-5 border border-dashed border-border rounded-xl p-10 text-center">
              <div className="text-4xl">
                📜
              </div>

              <h3 className="mt-4 font-medium">
                No transactions found
              </h3>

              <p className="mt-2 text-sm text-muted max-w-md mx-auto">
                {transactionFilter === "all"
                  ? "Add your first income or expense to start building your financial history."
                  : `No ${transactionFilter} transactions have been recorded yet.`}
              </p>

              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openTransactionForm(
                      transactionFilter === "income"
                        ? "income"
                        : "expense"
                    )
                  }
                  className="mt-5 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
                >
                  + Add Transaction
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 border border-border rounded-xl overflow-hidden bg-surface">
              <div className="divide-y divide-border">
                {visibleTransactions.map(
                  (transaction) => {
                    const account = accounts.find(
                      (item) =>
                        item.id ===
                        transaction.account_id
                    );

                    const isIncome =
                      transaction.transaction_type ===
                      "income";

                    const isDeleting =
                      deletingId ===
                      transaction.id;

                    return (
                      <div
                        key={transaction.id}
                        className="p-5 hover:bg-muted/5 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          <div className="flex items-start gap-4 min-w-0">
                            <div
                              className={`h-11 w-11 shrink-0 rounded-lg border border-border flex items-center justify-center text-xl ${
                                isIncome
                                  ? "bg-green-50 dark:bg-green-950/20"
                                  : "bg-red-50 dark:bg-red-950/20"
                              }`}
                            >
                              {isIncome
                                ? "↗"
                                : "↘"}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-medium truncate">
                                {transaction.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                                <span>
                                  {transaction.category}
                                </span>

                                <span>•</span>

                                <span>
                                  {account?.name ??
                                    "Account"}
                                </span>

                                <span>•</span>

                                <span>
                                  {formatDate(
                                    transaction.transaction_date
                                  )}
                                </span>
                              </div>

                              {transaction.description && (
                                <p className="mt-2 text-sm text-muted line-clamp-2">
                                  {
                                    transaction.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                            <span
                              className={`text-lg font-semibold whitespace-nowrap ${
                                isIncome
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {isIncome
                                ? "+"
                                : "-"}
                              {formatMoney(
                                transaction.amount
                              )}
                            </span>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditTransaction(
                                    transaction
                                  )
                                }
                                disabled={isDeleting}
                                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/20 disabled:opacity-50 transition"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTransaction(
                                    transaction
                                  )
                                }
                                disabled={isDeleting}
                                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition"
                              >
                                {isDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </section>

        {/* Bottom summary */}
        {!loading && accounts.length > 0 && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border border-border rounded-xl bg-surface p-5">
              <p className="text-sm text-muted">
                Active Accounts
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {accounts.length}
              </p>
            </div>

            <div className="border border-border rounded-xl bg-surface p-5">
              <p className="text-sm text-muted">
                Recorded Transactions
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {transactions.length}
              </p>
            </div>

            <div className="border border-border rounded-xl bg-surface p-5">
              <p className="text-sm text-muted">
                Net Financial Activity
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {formatMoney(summary.net_balance)}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}