import React, { useState, useEffect } from "react"
import Link from "next/link"
import { getUserByEmail, updateUserCreditCards, CreditCard } from "@/lib/mongodb"

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

export function CardsList() {
  console.log('CardsList rendered');
  
  const [cards, setCards] = useState<CardDisplayProps['card'][]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaceholderAccount, setIsPlaceholderAccount] = useState(false);
  const [formData, setFormData] = useState<CardFormData>({
    cardName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    issuer: "Chase",
    type: "credit"
  });
  // New state for card details and deletion confirmation
  const [selectedCard, setSelectedCard] = useState<CardDisplayProps['card'] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Fetch cards when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserCards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsPlaceholderAccount(false);
        console.log('Starting to fetch cards');
        
        // Now the API handles authentication through the Auth0 session
        const response = await fetch('/api/cards');
        console.log('API Response status:', response.status);
        
        if (!isMounted) return;
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch cards: ${response.status} ${response.statusText}`);
        }
        
        const user = await response.json();
        console.log('Full API Response data:', user);
        
        if (!isMounted) return;
        
        if (user && user.credit_cards && Array.isArray(user.credit_cards)) {
          console.log('Found credit_cards array:', user.credit_cards);
          
          // Check if this is a new user with empty cards array
          if (user.credit_cards.length === 0) {
            console.log('New user with no cards detected');
            setIsPlaceholderAccount(true);
            setCards([]);
            setError('Welcome! You don\'t have any cards yet. Click below to add your first card.');
          } else {
            // User has cards
            const formattedCards = user.credit_cards.map((card: CreditCard) => ({
              id: `card-${Date.now()}-${Math.random()}`,
              type: "credit",
              name: card.name,
              last4: card.last4,
              expires: card.expiry,
              issuer: card.card_type,
            }));
            
            console.log('Formatted cards:', formattedCards);
            
            if (isMounted) {
              setCards(formattedCards);
            }
          }
        } else {
          console.log('No valid credit_cards array found in user data:', user);
          if (isMounted) {
            setCards([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserCards:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch cards');
          setIsPlaceholderAccount(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserCards();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
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
  
  // Handler for opening card details
  const handleCardClick = (card: CardDisplayProps['card']) => {
    setSelectedCard(card);
    setIsDetailModalOpen(true);
  };

  // Handler for deleting a card
  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      // Filter out the card to be deleted
      const updatedCards = cards.filter(card => card.id !== selectedCard.id);
      
      // Prepare the data for MongoDB update
      const mongoCards = updatedCards.map(card => ({
        last4: card.last4,
        expiry: card.expires,
        card_type: card.issuer,
        name: card.name
      }));

      // Update the database
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditCards: mongoCards
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      // Update local state
      setCards(updatedCards);
      setIsDeleteConfirmOpen(false);
      setIsDetailModalOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };
  
  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);

  if (isLoading) {
    return (
      <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-8">
          {isPlaceholderAccount ? (
            // Show an informational message for placeholder accounts
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">{error}</p>
            </div>
          ) : (
            // Show an error message for actual errors
            <p className="text-red-600">Error: {error}</p>
          )}
        </div>
        
        {/* Continue showing the cards section if it's a placeholder account */}
        {isPlaceholderAccount && renderCardsList()}
      </div>
    );
  }

  return renderCardsList();

  // Helper function to render the cards list UI
  function renderCardsList() {
    const hasCards = cards.length > 0;
    
    return (
      <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Cards</h2>
          <span className="text-gray-500">Manage your connected payment cards</span>
        </div>
        
        <div className="relative rounded-xl overflow-hidden">
          {/* Scrollable cards container */}
          <div className="flex flex-col space-y-4">
            {/* If user has cards, display them */}
            {hasCards ? (
              <>
                {cards.map((card) => (
                  <div 
                    key={card.id} 
                    className="flex overflow-hidden rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-300 cursor-pointer"
                    onClick={() => handleCardClick(card)}
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
              </>
            ) : (
              // Larger, more inviting button for first card
              <div className="text-center py-8">
                <div className="mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 mx-auto text-gray-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" strokeWidth="1.5" />
                    <line x1="2" x2="22" y1="10" y2="10" strokeWidth="1.5" />
                  </svg>
                </div>
                {/* No cards message */}
                <p className="text-gray-500 mb-6">You haven't added any payment cards yet.</p>
              </div>
            )}
            
            {/* Add card button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center p-4 rounded-xl border-2 border-dashed ${hasCards ? 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700' : 'border-blue-300 text-blue-500 hover:border-blue-400 hover:text-blue-700'} hover:bg-gray-50 transition-colors`}
            >
              <div className="flex items-center gap-4 mx-auto">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hasCards ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <PlusIcon className={`h-5 w-5 ${hasCards ? 'text-gray-600' : 'text-blue-600'}`} />
                </div>
                <span className="font-medium">{hasCards ? 'Connect a New Card' : 'Add Your First Card'}</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Add Card Modal */}
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

        {/* Card Detail Modal */}
        {isDetailModalOpen && selectedCard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsDetailModalOpen(false)}>
            <div 
              className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl transform transition-all"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#0a192f] text-white p-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Card Details</h3>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-white hover:text-gray-200">
                  <XIcon />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Card Display */}
                <div className="flex justify-center">
                  <CardDisplay card={selectedCard} />
                </div>
                
                {/* Card Details */}
                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Card Name</h4>
                    <p className="text-lg font-medium text-gray-900">{selectedCard.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Card Number</h4>
                    <p className="text-lg font-medium text-gray-900">•••• •••• •••• {selectedCard.last4}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Card Issuer</h4>
                      <p className="text-lg font-medium text-gray-900">{selectedCard.issuer}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Card Type</h4>
                      <p className="text-lg font-medium text-gray-900">{getCardTypeLabel(selectedCard.type)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Expiration Date</h4>
                    <p className="text-lg font-medium text-gray-900">{selectedCard.expires}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <div className="flex justify-between">
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Remove Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && selectedCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl transform transition-all"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-center">Remove Card</h3>
                
                <p className="text-center text-gray-600">
                  Are you sure you want to remove <span className="font-medium">{selectedCard.name}</span> ending in <span className="font-medium">{selectedCard.last4}</span>?
                </p>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCard}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
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