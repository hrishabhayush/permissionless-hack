import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Clock, AlertCircle, TrendingUp, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// Interfaces match the Helius Parsed Transaction History API response
interface HeliusTransaction {
  signature: string;
  timestamp: number;
  slot: number;
  fee: number;
  type: string;
  source: string;
  transactionError: TransactionError | null;
  tokenTransfers: {
    fromUserAccount: string | null;
    toUserAccount: string | null;
    mint: string;
    tokenAmount: number;
  }[];
}

interface TransactionError {
  InstructionError?: [number, any];
  [key:string]: any;
}

interface SolanaTransactionsProps {
  address?: string;
  network?: 'mainnet-beta' | 'devnet';
  limit?: number;
  filterByTokenMint?: string;
}

const SolanaTransactions = ({
  address = '3QzXMwX4b6hwuNMKLjyZJtK4W5JqxoojgSKDX9Gqot3Y',
  network = 'mainnet-beta',
  limit = 25,
  filterByTokenMint
}: SolanaTransactionsProps) => {
  const [transactions, setTransactions] = useState<HeliusTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    const API_KEY = '3dabedd5-e4b3-4088-9053-8ae838617229'; // Replace with your Helius API key
    const baseUrl = network === 'devnet'
      ? 'https://api-devnet.helius.xyz'
      : 'https://api.helius.xyz';
    const url = `${baseUrl}/v0/addresses/${address}/transactions?api-key=${API_KEY}&limit=${limit}&type=TRANSFER`;

    try {
      const response = await fetch(url);
      const data: HeliusTransaction[] = await response.json();
      if (data.length === 0) {
        setTransactions([]);
        return;
      }

      const filteredByToken = filterByTokenMint
        ? data.filter((tx: HeliusTransaction) =>
            tx.tokenTransfers?.some(transfer => transfer.mint === filterByTokenMint)
          )
        : data;
      
      setTransactions(filteredByToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [address, network, filterByTokenMint, limit]);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  const getTokenTransferDetails = (tx: HeliusTransaction) => {
    if (!filterByTokenMint || !tx.tokenTransfers || !address) return null;

    const relevantTransfer = tx.tokenTransfers.find(t => t.mint === filterByTokenMint);
    if (!relevantTransfer) return null;

    const isSender = relevantTransfer.fromUserAccount?.toLowerCase() === address.toLowerCase();
    
    return {
      change: relevantTransfer.tokenAmount,
      isSender,
    };
  };

  const getStatusBadge = (err: TransactionError | null) => {
    return err ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Failed
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Success
      </span>
    );
  };

  const formatSOL = (lamports: number) => {
    return (lamports / 1000000000).toFixed(6);
  };

  if (!address) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center text-gray-600">
          <AlertCircle className="mx-auto h-16 w-16 mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Address Provided</h3>
          <p>Please provide a Solana address to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Transactions</h2>
            <p className="text-gray-600">Real-time Solana network activity</p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-gray-600" />
          <p className="text-sm font-medium text-gray-700">Wallet Address:</p>
        </div>
        <p className="font-mono text-sm text-gray-800 break-all bg-white px-3 py-2 rounded-lg border">{address}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="text-red-800 font-medium">Error Loading Transactions</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading transactions...</p>
            <p className="text-gray-500 text-sm">Fetching data from Helius</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
              <p>This address doesn't have any recent PYUSD transactions</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                Showing {transactions.length} most recent transactions
              </div>
              {transactions.map((tx, index) => {
                const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=${network}`;
                const transferDetails = getTokenTransferDetails(tx);

                return (
                  <div key={tx.signature} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        {getStatusBadge(tx.transactionError)}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Slot</div>
                        <div className="text-sm font-mono font-medium text-gray-700">
                          {tx.slot?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {transferDetails && (
                      <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${transferDetails.isSender ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {transferDetails.isSender ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        <span className="font-medium">{transferDetails.isSender ? 'Sent' : 'Received'}</span>
                        <span className="font-bold">{transferDetails.change.toFixed(2)} PYUSD</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Transaction Signature</div>
                        <span className="font-mono text-sm text-gray-800 font-medium">
                          {formatSignature(tx.signature)}
                        </span>
                      </div>
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Timestamp</div>
                        <div className="text-sm font-medium text-gray-800">
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Network Fee</div>
                        <div className="text-sm font-medium text-gray-800">
                          {formatSOL(tx.fee)} SOL
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Type</div>
                        <div className="text-sm font-medium text-gray-800 capitalize">
                          {tx.type.toLowerCase().replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    {tx.transactionError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-2">Transaction Error</div>
                        <pre className="text-xs text-red-700 font-mono overflow-x-auto">
                          {JSON.stringify(tx.transactionError, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SolanaTransactions;