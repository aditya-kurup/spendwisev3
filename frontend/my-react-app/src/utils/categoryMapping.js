/**
 * This utility provides consistent category mapping between the frontend and the model
 */

// Complete list of all categories used in the application
export const ALL_CATEGORIES = [
  // Need categories
  'Food and Drink > Groceries',
  'Housing > Rent',
  'Housing > Mortgage',
  'Housing > Utilities',
  'Transfer > Deposit',
  'Payment > Credit Card',
  'Payment > Loan',
  'Travel > Public Transportation',
  'Healthcare > Medical',
  'Healthcare > Pharmacy',
  'Healthcare > Insurance',
  'Service > Utilities',
  'Service > Phone',
  'Service > Internet',
  'Service > Subscription',
  'Education > Tuition',
  'Education > Books',
  
  // Want categories
  'Food and Drink > Restaurants',
  'Food and Drink > Coffee Shop',
  'Food and Drink > Alcohol & Bars',
  'Shopping > Clothing',
  'Shopping > Electronics',
  'Shopping > Home',
  'Shopping > Gifts',
  'Travel > Vacation',
  'Travel > Rideshare',
  'Travel > Hotel',
  'Travel > Air Travel',
  'Recreation > Gym',
  'Recreation > Entertainment',
  'Recreation > Sports',
  'Recreation > Hobbies',
  'Personal Care > Spa',
  'Personal Care > Beauty',
  'Other'
];

// Mapping from main category to budget category
export const CATEGORY_TO_BUDGET_MAPPING = {
  'Food and Drink': 'Food and Drink',
  'Housing': 'Housing',
  'Transfer': 'Bills & Services',
  'Payment': 'Bills & Services',
  'Travel': 'Travel',
  'Healthcare': 'Healthcare',
  'Service': 'Bills & Services',
  'Education': 'Education',
  'Shopping': 'Shopping',
  'Recreation': 'Recreation',
  'Personal Care': 'Personal Care',
  'Other': 'Other'
};

// Helper function to get the main category from a subcategory
export const getMainCategory = (category) => {
  if (!category) return 'Other';
  const parts = category.split(' > ');
  return parts[0] || 'Other';
};

// Helper function to get the budget category for a transaction
export const getBudgetCategory = (transaction) => {
  const mainCategory = getMainCategory(transaction.category);
  return CATEGORY_TO_BUDGET_MAPPING[mainCategory] || 'Other';
};

// Function to determine if a transaction is likely a need or want based on its category
export const isLikelyNeed = (category) => {
  const needCategories = [
    'Food and Drink > Groceries',
    'Housing',
    'Transfer > Deposit',
    'Payment',
    'Travel > Public Transportation',
    'Healthcare',
    'Service',
    'Education'
  ];
  
  return needCategories.some(needCat => category.includes(needCat));
};

// Function to get keywords from a transaction that might indicate needs/wants
export const getKeywordsFromTransaction = (transaction) => {
  const name = transaction.name.toLowerCase();
  const category = transaction.category.toLowerCase();
  
  const needKeywords = [
    'grocery', 'bill', 'utility', 'gas', 'rent', 'medical', 'insurance',
    'pharmacy', 'doctor', 'mortgage', 'housing'
  ];
  
  const wantKeywords = [
    'restaurant', 'coffee', 'entertainment', 'shopping', 'travel',
    'vacation', 'clothing', 'electronics', 'gift', 'spa', 'beauty'
  ];
  
  const foundNeedKeywords = needKeywords.filter(keyword => 
    name.includes(keyword) || category.includes(keyword)
  );
  
  const foundWantKeywords = wantKeywords.filter(keyword => 
    name.includes(keyword) || category.includes(keyword)
  );
  
  return {
    needKeywords: foundNeedKeywords,
    wantKeywords: foundWantKeywords,
    isLikelyNeed: foundNeedKeywords.length > foundWantKeywords.length
  };
};
