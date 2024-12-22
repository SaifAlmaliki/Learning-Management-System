"use client";

/**
 * This React component displays a user's payment history.
 * It fetches transactions from an API, allows filtering by payment type,
 * and shows the transactions in a table format. It provides a user-friendly
 * interface to view billing details.
 */

import Loading from "@/components/Loading"; // Loading spinner component for pending states.
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Select dropdown components for filtering.
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Table components for displaying transactions.
import { formatPrice } from "@/lib/utils"; // Utility function to format prices (e.g., USD).
import { useGetTransactionsQuery } from "@/state/api"; // API hook to fetch user transactions.
import { useUser } from "@clerk/nextjs"; // Clerk hook to get user information.
import React, { useState } from "react"; // React for state management and component rendering.

/**
 * @component UserBilling
 * @description Displays a user's billing information, including a filterable table of past transactions.
 * - Fetches transactions using `useGetTransactionsQuery`.
 * - Allows filtering by payment type: All, Stripe, or PayPal.
 * - Shows loading states and a fallback message when no transactions are available.
 */
const UserBilling = () => {
  // State to manage the selected payment type filter
  const [paymentType, setPaymentType] = useState("all");

  // Retrieve user information and load state using Clerk
  const { user, isLoaded } = useUser();

  // Fetch user transactions using the API query; skip fetch if user data isn't loaded
  const { data: transactions, isLoading: isLoadingTransactions } =
    useGetTransactionsQuery(user?.id || "", {
      skip: !isLoaded || !user,
    });

  // Filter transactions based on the selected payment type
  const filteredData =
    transactions?.filter((transaction) => {
      const matchesTypes =
        paymentType === "all" || transaction.paymentProvider === paymentType;
      return matchesTypes;
    }) || [];

  // Show loading spinner while user data is being loaded
  if (!isLoaded) return <Loading />;

  // If no user is detected, prompt them to sign in
  if (!user) return <div>Please sign in to view your billing information.</div>;

  return (
    <div className="billing">
      <div className="billing__container">
        {/* Page Title */}
        <h2 className="billing__title">Payment History</h2>

        {/* Filter Section: Allows users to filter transactions by payment type */}
        <div className="billing__filters">
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="billing__select">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem className="billing__select-item" value="all">
                All Types
              </SelectItem>
              <SelectItem className="billing__select-item" value="stripe">
                Stripe
              </SelectItem>
              <SelectItem className="billing__select-item" value="paypal">
                PayPal
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="billing__grid">
          {/* Show loading spinner while transactions are being fetched */}
          {isLoadingTransactions ? (
            <Loading />
          ) : (
            <Table className="billing__table">
              <TableHeader className="billing__table-header">
                <TableRow className="billing__table-header-row">
                  <TableHead className="billing__table-cell">Date</TableHead>
                  <TableHead className="billing__table-cell">Amount</TableHead>
                  <TableHead className="billing__table-cell">Payment Method</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="billing__table-body">
                {/* Render filtered transactions */}
                {filteredData.length > 0 ? (
                  filteredData.map((transaction) => (
                    <TableRow className="billing__table-row" key={transaction.transactionId}>
                      <TableCell className="billing__table-cell">
                        {new Date(transaction.dateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="billing__table-cell billing__amount">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="billing__table-cell">
                        {transaction.paymentProvider}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Fallback: No transactions available
                  <TableRow className="billing__table-row">
                    <TableCell
                      className="billing__table-cell text-center"
                      colSpan={3}
                    >
                      No transactions to display
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBilling;
