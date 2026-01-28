# 🏠 HouseShare

**HouseShare** is a modern web application designed to simplify shared living. It helps roommates manage chores, split expenses, and communicate effectively in a centralized dashboard.

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Tech-React_%7C_Firebase_%7C_Tailwind-blue)

## ✨ Features

### 🧹 Chores Management
-   **Task Tracking**: Create and assign household chores.
-   **Deadlines**: Set due dates to keep everyone accountable.
-   **Status**: Mark tasks as "Pending" or "Completed".

### 💸 Expense Sharing
-   **Split Costs**: Log shared expenses (e.g., Rent, Groceries, Utilities).
-   **Smart Balances**: Automatically calculates who owes whom.
-   **Net Debt**: Real-time view of your financial standing within the house.

### 📢 Communication Hub
-   **Announcements**: Post sticky notes for the whole house.
-   **Priority**: Mark urgent messages (e.g., "Landlord visiting tomorrow!").

### ⚙️ House Management
-   **Invite System**: Generate a unique 6-digit code to invite roommates.
-   **Multi-User**: Real-time updates for all members.

## 🛠️ Technology Stack

-   **Frontend**: React 18 (TypeScript)
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS & Shadcn UI
-   **Backend**: Firebase (Serverless)
    -   **Authentication**: Secure Email/Password login.
    -   **Firestore**: Real-time NoSQL database.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   A Firebase Project (Free tier)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kavinga-MKN/HouseShare.git
    cd HouseShare
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    -   Create a project at [console.firebase.google.com](https://console.firebase.google.com).
    -   Enable **Authentication** (Email/Pasword).
    -   Enable **Firestore Database** (Start in Test Mode).
    -   Copy your web config keys into `src/integrations/firebase/client.ts`.

4.  **Run the App**
    ```bash
    npm run dev
    ```

## 📸 Screenshots
*(Add screenshots of your Dashboard, Chores, and Expenses pages here)*

## 📄 License
This project is for educational purposes.
