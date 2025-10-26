# Personal Finance Management (PFM) Dashboard

## Project Overview
The **Personal Finance Management (PFM) Dashboard** is a web application designed to help users manage their finances efficiently. In today’s fast-paced world, individuals struggle to track their income, expenses, and investments across multiple platforms. This dashboard aggregates all financial data into a single, intuitive interface, allowing users to:

- Understand spending habits
- Monitor net worth
- Set and track budgets
- Make informed financial decisions

For the industry, such platforms drive user engagement and provide anonymized data for developing other financial products.

---

## Tech Stack
- **Frontend:** React.js, Recharts (for charts and visualizations), Tailwind CSS  
- **Backend:** Node.js with Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **APIs:** Plaid API (for securely connecting user bank accounts)  

---

## Features
1. **User Authentication**
   - Secure registration and login using JWT  
   - Passwords encrypted for security  

2. **Bank Account Integration**
   - Connect multiple bank accounts via Plaid API  
   - Fetch transaction history and account balances  

3. **Dashboard & Data Visualization**
   - Categorize transactions automatically  
   - Interactive charts using Recharts (pie charts for spending, bar charts for monthly summaries)  
   - Track income vs expenses  

4. **Budget Management**
   - Set monthly budgets for categories  
   - Monitor spending against limits  

5. **Manual Transaction Management**
   - Add or edit transactions manually  
   - Full CRUD support for user data  

6. **Testing & Security**
   - Unit and integration testing for backend logic  
   - End-to-end testing of user flows  
   - Secure API endpoints for authenticated users only  

---

## Development Phases & Milestones
### Week 1: Setup and User Authentication
- Initialize React and Node.js projects  
- Design MongoDB models: Users, Accounts, Transactions  
- Implement JWT-based authentication  
- Set up basic frontend layout and routing  

### Week 2: Bank Account Integration
- Register for Plaid developer account  
- Implement Plaid Link flow on frontend  
- Backend endpoints for token exchange and fetching transaction data  
- Display connected accounts and balances  

### Week 3: Dashboard and Visualizations
- Backend logic for transaction categorization  
- API endpoints for summarized dashboard data  
- Frontend charts using Recharts  
- Budgeting feature implementation  

### Week 4: Refinement, Testing, and Deployment
- Manual add/edit transaction functionality  
- Unit and integration tests for backend  
- End-to-end testing of user flows  
- UI/UX refinements  
- Project documentation and presentation preparation  

---

## Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Pranavs3010/pfm.git
cd pfm