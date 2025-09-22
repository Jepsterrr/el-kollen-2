# ⚡ El-Kollen 2.0

**El-Kollen 2.0 is a smart web application designed to help households in Sweden reduce their electricity costs by optimizing the usage of major appliances based on volatile spot prices.**

![Screenshot of El-Kollen 2.0 Dashboard] ## 🎯 The Problem

With hourly electricity spot prices (timpris), it's challenging for regular households to know the most cost-effective time to run high-consumption appliances like washing machines, tumble dryers, dishwashers, or to charge their electric vehicles. Existing apps often show the current price but fail to provide actionable, forward-looking advice.

## ✨ The Solution

El-Kollen 2.0 is a Progressive Web App (PWA) that provides personalized and actionable recommendations to directly lower electricity bills. It fetches upcoming electricity prices and, based on the user's own appliances and personal constraints (e.g., "I only want to run the dishwasher between 22:00 and 07:00"), it calculates the optimal time to run them.

The app features an advanced scheduling engine that can create an optimal schedule for multiple appliances, allowing for both parallel (maximum savings) and sequential (safer for the main fuse) execution strategies.

## 🚀 Key Features

* **User Authentication:** Secure sign-up and login using Firebase Authentication (Email/Password & Google).
* **Personalized Appliance Management:** Users can add, edit, and delete their home appliances.
* **Appliance Presets:** A rich list of preset appliances (Dishwasher, EV Charger, etc.) with pre-filled, realistic power consumption and duration values for easy setup.
* **Custom Time Windows:** Users can define personal time constraints for each appliance (e.g., "earliest start time," "latest finish time").
* **Dynamic Price Visualization:** Displays current and upcoming electricity prices in a clean table and an interactive chart.
* **Advanced Scheduling Engine:**
    * Optimizes the schedule for multiple appliances simultaneously.
    * **Parallel Mode:** Calculates the absolute cheapest time for each appliance, allowing for overlap to maximize savings.
    * **Sequential Mode:** Creates a conflict-free schedule by running appliances one after another, which is safer for the home's main fuse.
* **Concrete Savings Calculation:** Clearly shows the user how much they save in SEK compared to running the appliance immediately or at the day's peak price.
* **Dynamic Price Area Selection:** Users can select their correct Swedish price area (SE1-SE4) for accurate calculations.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Frontend:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
* **Database:** [Firestore](https://firebase.google.com/docs/firestore) (for user and appliance data)
* **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
* **Data Visualization:** [Chart.js](https://www.chartjs.org/) with `react-chartjs-2`
* **Icons:** [React Icons](https://react-icons.github.io/react-icons/)

## ⚙️ Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* Node.js (v18 or later)
* npm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Jepsterrr/el-kollen-2.git]
    cd el-kollen-2
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    * Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    * Enable **Authentication** (with Email/Password and Google providers).
    * Enable the **Firestore Database**.
    * In your project settings, create a new Web App and copy the `firebaseConfig` credentials.

4.  **Set up environment variables:**
    * Create a file named `.env.local` in the root of the project.
    * Add your Firebase credentials to this file:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Development (Vidareutveckling)

The core functionality is complete, but there are several exciting paths for future development:

* **Smart Home Integration:** The ultimate feature would be to move from recommendation to automation. By integrating with smart plug APIs (e.g., Shelly, TP-Link Kasa) or home automation platforms (Home Assistant), the app could automatically start appliances at the optimal time.

* **Optimization for Network Tariffs (`Effekttariffer`):** A more advanced algorithm could be developed to not only minimize the cost of energy (öre/kWh) but also to minimize the user's monthly peak power consumption (kW), which can result in significant savings on network tariffs.

* **Solar Panel Integration:** For users with solar panels, the app could integrate with inverter APIs to fetch solar production forecasts. The optimization algorithm could then prioritize using self-generated, "free" electricity, further increasing savings and self-sufficiency.

* **Push Notifications:** A system for sending proactive push notifications to remind the user when it's time to start an appliance.

* **History & Gamification:** A history view showing total savings over time, creating a rewarding and engaging user experience.

---