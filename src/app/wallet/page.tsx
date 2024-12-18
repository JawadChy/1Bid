"use client";

import { useEffect, useState } from "react";
import NumberTicker from "@/components/ui/number-ticker";
import { 
  Wallet,
  Plus,
  Minus,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Transaction, columns } from "./columns";
import { DataTable } from "./data-table";

import { Navbar } from "@/components/navbar";
import { toast } from "react-hot-toast";

const WalletPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickerDirection, setTickerDirection] = useState<'up' | 'down'>('up');

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // when mount get data for bal + txn
  useEffect(() => {
    fetchBalanceAndTransactions();
  }, []);

  const handleTransaction = async (type: 'DEPOSIT' | 'WITHDRAWAL') => {
    if (!amount || isNaN(Number(amount))) return;
    
    setLoading(true);
    const numAmount = Number(amount);
    const oldBalance = balance;
    
    try {
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount: numAmount,
        }),
      });

      if (!response.ok) throw new Error('Transaction failed');
    
      setTickerDirection(type === 'DEPOSIT' ? 'up' : 'down');
      
      await fetchBalanceAndTransactions();
      setAmount("");

      if (type === 'DEPOSIT') {
        setDepositDialogOpen(false);
      } else {
        setWithdrawDialogOpen(false);
      }

    } catch (error) {

      console.error('Transaction error:', error);

    } finally {

      setLoading(false);
    }
  };

  const fetchBalanceAndTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transaction');
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const data = await response.json();
      if (data.balance !== undefined) {
        setBalance(Number(data.balance));
        setTransactions(data.transactions || []);
      } else {
        console.error('No balance data received:', data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    }
  };

  const handleAddFunds = async (amount: number) => {
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add funds');
      }

      toast.success(data.data.message);
      // Refresh the wallet balance display
      fetchBalanceAndTransactions();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add funds');
    }
  };

  return (
    <>
    <Navbar animated={false} />
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Wallet</CardTitle>
              <CardDescription>Manage your funds</CardDescription>
            </div>
            <Wallet className="h-8 w-8 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-sm text-gray-500 mb-2">Current Balance</div>
            <div className="whitespace-pre-wrap text-7xl font-medium tracking-tighter text-black dark:text-white mb-6">
                $ <NumberTicker 
                    value={balance} 
                    start={balance} 
                    decimalPlaces={2} 
                    direction={tickerDirection} 
                />
            </div>
            <div className="flex gap-4">
              <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Money to Wallet</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to deposit
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <Button 
                    onClick={() => handleTransaction('DEPOSIT')}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {loading ? 'Processing...' : 'Deposit'}
                  </Button>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Minus className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Money</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to withdraw
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={balance}
                    />
                  </div>
                  <Button 
                    onClick={() => handleTransaction('WITHDRAWAL')}
                    disabled={loading || Number(amount) > balance}
                    variant="outline"
                  >
                    {loading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={transactions} />
        </CardContent>
      </Card>
    </div>
    </div>
    </>
  );
};

export default WalletPage;