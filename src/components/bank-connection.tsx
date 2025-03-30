"use client"

import { useState } from "react"

export default function BankConnection() {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)

    // Simulate connection process
    setTimeout(() => {
      alert("Bank connected successfully! Please refresh the page.")
      setIsConnecting(false)
    }, 1500)
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Connect Your Card</h3>
        <p className="text-zinc-400 mb-6">
          Connect your credit or debit card to get personalized deals based on your spending habits.
        </p>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-zinc-600 hover:bg-zinc-500 focus:outline-none disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Card"}
        </button>
      </div>

      <div className="mt-8 border-t border-zinc-700 pt-6">
        <h4 className="text-sm font-medium text-white mb-4">Benefits</h4>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-zinc-400 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-zinc-300">Get personalized deals based on your spending habits</span>
          </li>
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-zinc-400 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-zinc-300">Track your spending across different categories</span>
          </li>
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-zinc-400 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-zinc-300">Discover savings opportunities you might have missed</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 text-xs text-zinc-500">
        <p>
          Your data is secure and encrypted. We use bank-level security to protect your information and will never share
          your data without your permission.
        </p>
      </div>
    </div>
  )
}

