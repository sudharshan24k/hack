# 💼 Investment Portfolio Dashboard

A **modern, responsive web application** designed for **comprehensive investment tracking**, **portfolio management**, and **real-time financial analysis**. Built to simplify personal finance while empowering users with smart tools, calculators, and AI-driven recommendations.

---

## 🌟 Core Features

### 📊 Portfolio Management

* 🔹 **Multi-Asset Support**: Add and track various asset types (stocks, bonds, mutual funds, ETFs, crypto, etc.)
* 🔹 **Performance Metrics**: Real-time calculations for asset growth, portfolio returns, and profit/loss summaries
* 🔹 **Dynamic Asset Overview**: View top-performing assets, risk analysis, and asset allocation charts
* 🔹 **CRUD Operations**: Easily Add, Edit, Delete, and View assets
* 🔹 **Portfolio Snapshots**: Get summarized insights at a glance

### 🧮 Financial Calculators

* 🟦 **SIP (Systematic Investment Plan)**: Calculate potential returns based on monthly investments, duration, and expected annual return
* 🟦 **FD (Fixed Deposit)**: Estimate maturity value and interest earnings based on tenure and rate
* 🟦 **PF (Provident Fund)**: Project long-term corpus based on monthly contributions, interest rate, and years
* 🟦 **Interactive Results**: Real-time feedback with chart-based visualizations

### 🧠 AI Integration

* 🤖 **AI Investment Helper**: Personalized investment tips and asset suggestions
* 📊 **Portfolio Health Check**: Detect underperforming assets and suggest rebalancing
* 🔍 **Market Insights**: Get current news, trends, and opportunities based on your portfolio

### 💰 Personal Finance Tools

* 📚 **Educational Resources**: Access curated articles and learning modules
* 🔧 **Budget & Expense Tracker** (planned)
* 📈 **Financial Planning Tools**: Build savings plans and retirement goals (upcoming)

---

## 🛠️ Technology Stack

### 🎨 Frontend

* **React.js**: Component-based UI development
* **Tailwind CSS**: Utility-first modern styling
* **Chart.js**: Interactive and responsive charts for analytics
* **Framer Motion**: Smooth transitions and animations

### ⚙️ Backend

* **Node.js** & **Express.js**: RESTful API development
* **MongoDB**: Flexible NoSQL data storage
* **Mongoose**: Schema-based database modeling
* **JWT**: Secure user authentication and session management

---

## 📦 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/sudharshan24k/hack.git
cd hack
```

### Step 2: Install Dependencies

```bash
# Server dependencies
npm install

# Client dependencies
cd client
npm install
```

### Step 3: Environment Configuration

```bash
# Create .env file in root
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Step 4: Start Development Servers

```bash
# Start backend (root directory)
npm run server

# Start frontend (client directory)
npm start
```

---

## 🚀 App Usage Guide

### 📈 Dashboard Overview

* Total portfolio value, net gain/loss
* Performance percentages
* Asset distribution pie charts
* One-click access to calculators

### ➕ Managing Portfolios

* Add New Asset → Step-by-step modal: Basic Info > Price > Risk > Review
* Edit existing portfolio assets
* Delete assets with confirmation
* View individual performance cards with key stats

### 🧮 Using Calculators

* Input monthly/yearly investment, rate of return, duration
* Instantly see results
* Compare saved calculations (planned)
* Use charts to visualize financial growth

### 🤖 AI Tools

* Trigger AI recommendations on the dashboard
* Receive actionable insights
* Real-time response based on portfolio contents

---

## 🎨 UI Components

### 🗂️ Portfolio Cards

* Responsive design for all devices
* Includes asset icons, names, gain/loss indicators, quick actions

### 🧾 Calculator Modules

* Step-by-step interactive forms
* Pre-filled examples and validation hints
* Visual charts for every result

### 🧭 Navigation & Layout

* Header with logo, nav links, and dropdown menus
* Dark mode toggle (upcoming)
* Mobile-responsive hamburger menu

---

## 🔒 Security Measures

* JWT-based authentication
* Passwords hashed with bcrypt
* Server-side validation for all inputs
* Role-based access for future enterprise features
* Secure HTTP headers using Helmet.js

---

## 🌐 API Endpoints

### 📌 Authentication

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/logout
```

### 📌 Portfolio

```
GET /api/portfolio
POST /api/portfolio
PUT /api/portfolio/:id
DELETE /api/portfolio/:id
```

### 📌 Calculators

```
POST /api/calculators/sip
POST /api/calculators/fd
POST /api/calculators/pf
```

---

## 📅 Planned Enhancements

* 🔁 Real-time stock/crypto data via market APIs
* 📱 Mobile app (React Native)
* 📤 Export portfolio to CSV/PDF
* 🏦 Bank integration for auto-tracking
* 💬 Chat-based financial advisor
* 🌍 Multi-language and currency support

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request and describe your changes

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file.

---

## 👥 Author

* **Sudharshan Venkatraman**
  GitHub: [@sudharshan24k](https://github.com/sudharshan24k)

---

## 🙏 Acknowledgments

* React & Tailwind CSS community
* Chart.js for analytics components
* All open-source contributors & testers

---

## 📞 Support & Contact

* Email: **[support@investmentdashboard.com](mailto:support@investmentdashboard.com)**
* GitHub Issues: [Submit a bug or feature request](https://github.com/sudharshan24k/hack/issues)

---

## 🔄 Changelog & Versions

### Latest Updates (v1.3.0)

* ✔️ Personal Finance page added
* ✔️ Calculator UI improvements
* ✔️ Dashboard layout revamp
* ✔️ AI Investment Helper beta added

### Previous Versions

* **v1.2.0**: Integrated AI helper
* **v1.1.0**: Added SIP, FD, PF calculators
* **v1.0.0**: MVP release

---

> "Build your financial future, one smart investment at a time."
