import React, { useState, useEffect } from "react"
import Link from "next/link"
import { getUserByEmail, updateUserCreditCards, CreditCard } from "@/lib/mongodb"
import { Button } from "@/components/ui/button"
import { PlusCircleIcon, CreditCardIcon } from "@heroicons/react/24/outline"

interface CardDisplayProps {
  card: {
    id: string
    type: string
    name: string
    last4: string
    expires: string
    issuer: string
    color?: string
  }
}

interface CardFormData {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  issuer: string;
  type: string;
}

interface CardsListProps {
  cards: {
    id: string;
    type: string;
    name: string;
    last4: string;
    expires: string;
    issuer: string;
  }[];
}

export function CardDisplay({ card }: CardDisplayProps) {
  const { gradientClass, patternClass, chipClass } = getCardStyle(card.issuer, card.type)
  
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-xl ${patternClass}`}>
      <div className={`p-5 text-white ${gradientClass} h-48 w-80 flex flex-col justify-between`}>
        {/* Card issuer and icon */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-sm font-semibold tracking-wider uppercase">{card.issuer}</span>
          <CardIcon className="h-6 w-6" />
        </div>
        
        {/* Card chip */}
        <div className={`w-10 h-7 ${chipClass} rounded-md relative z-10`}></div>
        
        {/* Card number */}
        <div className="flex items-baseline gap-1 relative z-10">
          <span className="text-sm opacity-70">••••</span>
          <span className="text-sm opacity-70">••••</span>
          <span className="text-sm opacity-70">••••</span>
          <span className="text-base font-mono tracking-wider">{card.last4}</span>
        </div>
        
        {/* Card details (bottom) */}
        <div className="flex justify-between items-end relative z-10">
          <h3 className="text-lg font-bold truncate max-w-[70%]">{card.name}</h3>
          <div className="text-sm font-medium">
            {card.expires}
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
      </div>
    </div>
  )
}

export function CardsList({ cards }: CardsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CardFormData>({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    issuer: "Chase",
    type: "credit"
  });

  // Empty state when no cards are available
  if (!cards || cards.length === 0) {
    return (
      <div className="rounded-lg border p-4 h-full flex flex-col items-center justify-center text-center">
        <CreditCardIcon className="h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium">No Payment Cards</h3>
        <p className="text-sm text-gray-500 mb-4">Add a payment card to track your rewards and offers</p>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Connect a Card
        </Button>
        
        {isModalOpen && (
          <CardFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Extract only the last 4 digits from the card number
    const last4 = formData.cardNumber.slice(-4);
    
    // Create a new card object
    const newCard: CardDisplayProps['card'] = {
      id: `card-${Date.now()}`,
      name: formData.cardName,
      last4: last4,
      type: formData.type,
      issuer: formData.issuer,
      expires: `${formData.expiryMonth}/${formData.expiryYear}`,
    };

    // Create the MongoDB credit card object
    const mongoCard: CreditCard = {
      last4: last4,
      expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
      card_type: formData.issuer,
      name: formData.cardName
    };
    
    try {
      // Update the database through the API
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "user@example.com", // Replace with actual user email
          creditCards: [...cards.map(card => ({
            last4: card.last4,
            expiry: card.expires,
            card_type: card.issuer,
            name: card.name
          })), mongoCard]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cards');
      }

      // Update the local state
      setCards(prevCards => [...prevCards, newCard]);
      
      // Close the modal and reset form
      setIsModalOpen(false);
      setFormData({
        cardName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        issuer: "Chase",
        type: "credit"
      });
    } catch (error) {
      console.error('Error updating cards:', error);
    }
  };
  
  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Cards</h2>
        <span className="text-gray-500">Manage your connected payment cards</span>
      </div>
      
      <div className="relative rounded-xl overflow-hidden">
        {/* Scrollable cards container */}
        <div className="flex flex-col space-y-4">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="flex overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              {/* Colored bar on the left, similar to Netflix UI */}
              <div className="w-2 bg-blue-600"></div>
              
              <div className="flex items-center p-4 w-full bg-white">
                <div className="flex-shrink-0 mr-6">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getIssuerBgClass(card.issuer)}`}>
                    <span className="text-white text-xs font-bold">{getIssuerInitials(card.issuer)}</span>
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <div className="flex items-baseline">
                    <h3 className="text-lg font-medium text-gray-900">{card.name}</h3>
                    <span className="ml-2 text-sm text-gray-500">•••• {card.last4}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">{card.issuer}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{getCardTypeLabel(card.type)}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">Expires {card.expires}</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="text-gray-400 hover:text-gray-500">
                    <CardIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <PlusIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Connect a New Card</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          {/* Modal Content */}
          <div 
            className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0a192f] text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Connect a New Card</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">
                <XIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="e.g. 'Sapphire Reserve'"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Enter the name of your card (e.g. "Sapphire Reserve")</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="•••• •••• •••• ••••"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  maxLength={19}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Issuer
                  </label>
                  <div className="relative">
                    <select
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleInputChange}
                      className="w-full p-3 appearance-none bg-white border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="Chase">Chase</option>
                      <option value="American Express">American Express</option>
                      <option value="Citi">Citi</option>
                      <option value="Capital One">Capital One</option>
                      <option value="Discover">Discover</option>
                      <option value="TD">TD</option>
                      <option value="BMO">BMO</option>
                      <option value="RBC">RBC</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="CIBC">CIBC</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Visa">Visa</option>
                      <option value="Tangerine">Tangerine</option>
                      <option value="HSBC">HSBC</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Type
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-3 appearance-none bg-white border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                      <option value="prepaid">Prepaid</option>
                      <option value="rewards">Rewards</option>
                      <option value="business">Business</option>
                      <option value="secured">Secured</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Month
                  </label>
                  <div className="relative">
                    <select
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className="w-full p-3 appearance-none bg-white border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        return (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Year
                  </label>
                  <div className="relative">
                    <select
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      className="w-full p-3 appearance-none bg-white border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year.toString().slice(-2)}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mt-2">
                <p className="text-xs text-amber-800">
                  <span className="font-medium">Security Note:</span> For security reasons, we only store the last 4 digits of your card number. You'll need to enter the full number when making purchases.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0a192f] text-white rounded-md hover:bg-[#162944] transition-colors"
                >
                  Connect Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function getCardStyle(issuer: string, type: string): { gradientClass: string; patternClass: string; chipClass: string } {
  // First determine color based on card type
  let baseGradient = '';
  
  switch (type.toLowerCase()) {
    case 'credit':
      baseGradient = 'from-blue-600 via-blue-500 to-blue-700';
      break;
    case 'debit':
      baseGradient = 'from-green-600 via-green-500 to-green-700';
      break;
    case 'prepaid':
      baseGradient = 'from-purple-600 via-purple-500 to-purple-700';
      break;
    case 'rewards':
      baseGradient = 'from-amber-600 via-amber-500 to-amber-700';
      break; 
    case 'business':
      baseGradient = 'from-slate-700 via-slate-600 to-slate-800';
      break;
    case 'secured':
      baseGradient = 'from-teal-600 via-teal-500 to-teal-700';
      break;
    default:
      baseGradient = 'from-gray-700 via-gray-600 to-gray-800';
  }
  
  // Then customize further based on issuer
  switch (issuer.toLowerCase()) {
    case 'american express':
      return {
        gradientClass: `bg-gradient-to-br ${type.toLowerCase() === 'credit' ? 'from-blue-800 via-blue-700 to-blue-900' : baseGradient}`, 
        patternClass: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15)_0,transparent_60%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'chase':
      return {
        gradientClass: `bg-gradient-to-r ${baseGradient}`, 
        patternClass: 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2)_0,transparent_60%)]',
        chipClass: 'bg-gradient-to-br from-yellow-300 to-yellow-500'
      }
    case 'citi':
      return {
        gradientClass: `bg-gradient-to-br ${type.toLowerCase() === 'credit' ? 'from-indigo-600 to-indigo-800' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'capital one':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-red-700 via-red-600 to-red-800' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0,transparent_70%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'discover':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-orange-500 via-orange-400 to-orange-600' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_25%,transparent_25%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'td':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-green-700 via-green-600 to-green-800' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0,transparent_60%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'bmo':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-blue-800 via-blue-700 to-blue-900' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.2)_0,transparent_60%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'rbc':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-blue-900 via-blue-800 to-indigo-900' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'scotiabank':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-red-800 via-red-700 to-red-900' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0,transparent_70%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'cibc':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-red-600 via-red-500 to-red-700' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(60deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'mastercard':
      return {
        gradientClass: `bg-gradient-to-br ${type.toLowerCase() === 'credit' ? 'from-orange-600 via-orange-500 to-red-600' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_70%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'visa':
      return {
        gradientClass: `bg-gradient-to-br ${type.toLowerCase() === 'credit' ? 'from-blue-700 via-blue-600 to-indigo-700' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'tangerine':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-orange-600 via-orange-500 to-orange-700' : baseGradient}`,
        patternClass: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0,transparent_70%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    case 'hsbc':
      return {
        gradientClass: `bg-gradient-to-r ${type.toLowerCase() === 'credit' ? 'from-red-700 via-red-600 to-red-800' : baseGradient}`,
        patternClass: 'bg-[linear-gradient(60deg,rgba(255,255,255,0.1)_25%,transparent_25%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
    default:
      return {
        gradientClass: `bg-gradient-to-r ${baseGradient}`,
        patternClass: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0,transparent_70%)]',
        chipClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      }
  }
}

// Helper functions for the new UI
function getIssuerBgClass(issuer: string): string {
  switch (issuer.toLowerCase()) {
    case 'american express':
      return 'bg-blue-800';
    case 'chase':
      return 'bg-blue-600';
    case 'citi':
      return 'bg-indigo-600';
    case 'capital one':
      return 'bg-red-600';
    case 'discover':
      return 'bg-orange-500';
    case 'td':
      return 'bg-green-600';
    case 'bmo':
      return 'bg-blue-800';
    case 'rbc':
      return 'bg-blue-900';
    case 'scotiabank':
      return 'bg-red-700';
    case 'cibc':
      return 'bg-red-600';
    case 'mastercard':
      return 'bg-orange-600';
    case 'visa':
      return 'bg-blue-700';
    case 'tangerine':
      return 'bg-orange-500';
    case 'hsbc':
      return 'bg-red-700';
    default:
      return 'bg-gray-700';
  }
}

function getIssuerInitials(issuer: string): string {
  if (!issuer) return '';
  
  const words = issuer.split(' ');
  if (words.length === 1) {
    return issuer.substring(0, 2).toUpperCase();
  }
  
  return words.map(word => word[0]).join('').toUpperCase();
}

function getCardTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case 'credit':
      return 'Credit Card';
    case 'debit':
      return 'Debit Card';
    case 'prepaid':
      return 'Prepaid Card';
    case 'rewards':
      return 'Rewards Card';
    case 'business':
      return 'Business Card';
    case 'secured':
      return 'Secured Card';
    default:
      return type;
  }
} 