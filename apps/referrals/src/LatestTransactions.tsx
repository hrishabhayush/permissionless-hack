import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Clock, AlertCircle } from 'lucide-react';

const SolanaTransactions = ({ address, limit = 10 }: any) => {
  const [transactions, setTransactions] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    const RPC_ENDPOINT = 'https://solana-api.projectserum.com';


    try {
      // Fetch transaction signatures
      const signaturesResponse = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit }]
        })
      });

      const signaturesData = await signaturesResponse.json();

      if (signaturesData.error) {
        throw new Error(signaturesData.error.message);
      }

      const signatures = signaturesData.result;

      // Fetch transaction details
      const transactionPromises = signatures.map(async (sig: any) => {
        const txResponse = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [sig.signature, { maxSupportedTransactionVersion: 0 }]
          })
        });

        const txData = await txResponse.json();
        return {
          signature: sig.signature,
          blockTime: sig.blockTime,
          slot: sig.slot,
          err: sig.err,
          transaction: txData.result
        };
      });

      const transactionResults = await Promise.all(transactionPromises);
      setTransactions(transactionResults.filter((tx: any) => tx.transaction !== null));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatSignature = (signature: any) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  const getStatusColor = (err: any) => {
    return err ? 'text-red-600' : 'text-green-600';
  };

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p>Please provide a Solana address to view transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Transactions</h2>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Address:</p>
        <p className="font-mono text-sm break-all">{address}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">Error: {error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading transactions...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 mb-4" />
              <p>No transactions found</p>
            </div>
          ) : (
            transactions.map((tx: any, index: any) => (
              <div key={tx.signature} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(tx.err)}`}>
                      {tx.err ? 'Failed' : 'Success'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Slot: {tx.slot?.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-gray-700">
                    {formatSignature(tx.signature)}
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="text-sm text-gray-500">
                  {formatDate(tx.blockTime)}
                </div>

                {tx.err && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    Error: {JSON.stringify(tx.err)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SolanaTransactions;