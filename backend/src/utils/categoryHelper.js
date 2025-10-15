const categoryMapping = {
  "Food and Drink": [
    "Food",
    "Restaurant",
    "Fast Food",
    "Coffee Shop",
    "Bar",
    "Groceries",
  ],
  Transportation: [
    "Gas",
    "Public Transportation",
    "Taxi",
    "Uber",
    "Lyft",
    "Parking",
  ],
  Shopping: [
    "Clothing",
    "Electronics",
    "General Merchandise",
    "Online Shopping",
  ],
  Entertainment: ["Movies", "Music", "Games", "Streaming Services", "Events"],
  "Bills & Utilities": [
    "Utilities",
    "Phone",
    "Internet",
    "Cable",
    "Rent",
    "Mortgage",
  ],
  Healthcare: ["Pharmacy", "Doctor", "Dentist", "Hospital", "Health Insurance"],
  Travel: ["Airlines", "Hotels", "Car Rental", "Travel"],
  Personal: ["Gym", "Salon", "Spa", "Personal Care"],
  Education: ["Books", "Tuition", "School Supplies"],
  Income: ["Paycheck", "Salary", "Deposit", "Refund", "Bonus"],
};

exports.categorizeTransaction = (transactionName, plaidCategories = []) => {
  // Check Plaid categories first
  if (plaidCategories && plaidCategories.length > 0) {
    const primaryPlaidCategory = plaidCategories[0];

    for (const [mainCategory, keywords] of Object.entries(categoryMapping)) {
      if (
        keywords.some((keyword) =>
          primaryPlaidCategory.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return mainCategory;
      }
    }
  }

  // Fallback to transaction name matching
  const lowerName = transactionName.toLowerCase();

  for (const [mainCategory, keywords] of Object.entries(categoryMapping)) {
    if (keywords.some((keyword) => lowerName.includes(keyword.toLowerCase()))) {
      return mainCategory;
    }
  }

  return "Uncategorized";
};

exports.getAllCategories = () => {
  return Object.keys(categoryMapping);
};
