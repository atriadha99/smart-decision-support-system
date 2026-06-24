# Smart Decision Support System (SDSS)

SDSS is a universal, web-based Decision Support System (Sistem Pendukung Keputusan / SPK) designed to support multiple decision-making methods for arbitrary, dynamic study cases (such as selecting laptops, smartphones, motorbikes, employees, or scholarship candidates).

Built with **React, Vite, Tailwind CSS, React Router, Recharts, React Hook Form, and Zod**. It has a **Dual-Adapter Database Architecture** that runs instantly out of the box using Local Storage and can be easily configured to connect to a live **Supabase PostgreSQL** instance.

---

## Key Features

1. **Dashboard Analytics:** Visualizations of case studies, criteria weight distribution (Pie Chart), alternative performance profiles (Radar Chart), and overall ranking comparison (Bar Chart).
2. **Universal Case Study Management:** Complete CRUD interface to create, edit, or delete arbitrary study cases.
3. **Criteria & Weight Management:** CRUD for criteria, weight validations ($\sum W_j = 1.0$), and a **"Normalkan Bobot" (Normalize Weights)** button to scale weights instantly.
4. **Interactive AHP Weights Modeler:** Inside the criteria page, users can build a pairwise comparison matrix to automatically calculate weights, checking the Consistency Ratio (CR < 0.1) in real-time before applying them.
5. **Alternative Management:** CRUD for alternative choices, supporting categorization and tags.
6. **Dynamic Scoring Matrix:** Grid interface to fill evaluations for each alternative across all criteria.
7. **Step-by-Step SPK Algorithms:** Visualizes intermediate matrices and steps for:
   - **SAW** (Simple Additive Weighting)
   - **WP** (Weighted Product)
   - **TOPSIS** (Technique for Order Preference by Similarity to Ideal Solution)
   - **SMART** (Simple Multi-Attribute Rating Technique)
   - **Profile Matching** (Core/Secondary Factors & GAP Analysis)
   - **AHP** (Analytic Hierarchy Process Synthesis)
   - **MOORA** (Multi-Objective Optimization on the basis of Ratio Analysis)
8. **Admin Authentication:** Protected CRUD operations.
   - **Email:** `admin@sdss.com`
   - **Password:** `admin`
9. **Premium UI/UX:** Responsive mobile-first layout, dark mode, smooth transitions, custom scrollbars, and print-ready styles for exporting PDF reports.
10. **Reports Suite:** Print PDF reports, export Excel-compatible CSVs, and save calculation logs to database history.

---

## Installation & Quick Start

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone/Open the Project Directory
Navigate to the root directory `smart-decision-support-system`:
```bash
cd smart-decision-support-system
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.
*Note: The application will boot in **Local Storage mode** and auto-seed sample studies (Laptop selection and Employee selection) so it is fully functional instantly.*

---

## Connecting to Supabase PostgreSQL

If you wish to run the application using a live Supabase PostgreSQL database:

### 1. Execute SQL Migration
1. Go to your **Supabase Dashboard** > **SQL Editor**.
2. Copy the contents of `src/db/schema.sql` and run it to create tables and performance indexes.
3. (Optional) Run the contents of `src/db/seed.sql` to populate sample data.

### 2. Set Up Environment Variables
Create a `.env` file in the project root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Activate Supabase Client
Open [src/db/client.js](file:///src/db/client.js) and change the database configuration type at line 12:
```javascript
const DB_TYPE = 'supabase'; // Changed from 'local'
```
Restart your development server. The application will now query and write to your live PostgreSQL database.

---

## Directory Structure

```
smart-decision-support-system/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/      # Shared UI Components (Layout, ThemeToggle, Navbar, Modal)
│   ├── context/         # React state providers (Theme, Auth, Database contexts)
│   ├── db/              # SQL Migrations, Seed Data, Local DB Client, Supabase client
│   │   ├── client.js    # Dual-adapter DB manager (local vs live database)
│   │   ├── schema.sql   # PostgreSQL Schema
│   │   ├── seed.sql     # PostgreSQL Seed Data
│   │   └── supabaseClient.js # Supabase connection setup
│   ├── pages/           # Pages (Dashboard, CaseManagement, Criteria, Alternatives, Scoring, Calculation, Auth)
│   ├── utils/           # SPK Core Mathematical algorithms
│   │   ├── saw.js
│   │   ├── wp.js
│   │   ├── topsis.js
│   │   ├── smart.js
│   │   ├── pm.js
│   │   └── ahp.js
│   ├── App.jsx          # Route declarations & admin guards
│   ├── index.css        # Tailwind and print CSS
│   └── main.jsx         # DOM mounting
├── package.json
├── tailwind.config.js   # Custom dark themes and Outfit font setup
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

## Technical Formulas Summary

### SAW (Simple Additive Weighting)
* **Normalization ($R$):**
  - Benefit: $R_{ij} = x_{ij}/\max(x_{kj})$
  - Cost: $R_{ij} = \min(x_{kj})/x_{ij}$
* **Score ($V_i$):** $V_i = \sum w_j \cdot R_{ij}$

### WP (Weighted Product)
* **Vektor S ($S_i$):** $S_i = \prod x_{ij}^{w'_j}$ (where $w'_j$ is negative for cost criteria).
* **Vektor V ($V_i$):** $V_i = S_i / \sum S_k$

### TOPSIS
* **Normalization ($R_{ij}$):** $R_{ij} = x_{ij}/\sqrt{\sum x_{kj}^2}$
* **Ideal Solutions ($A^+$/$A^-$):** Extreme boundaries of weighted normalized values ($V_{ij} = R_{ij} \cdot w_j$).
* **Distances ($D^+_i$/$D^-_i$):** Euclidean distance to ideal positives and negatives.
* **Preference ($V_i$):** $V_i = D^-_i / (D^+_i + D^-_i)$

### SMART
* **Utility ($U_{ij}$):** Range-scaling: $U_{ij} = 100 \cdot (x_{ij} - \min)/(\max - \min)$ for benefit, reversed for cost.
* **Final Value ($V_i$):** $V_i = \sum w_j \cdot U_{ij}$

### Profile Matching
* **GAP:** $GAP_{ij} = x_{ij} - Target_j$.
* **Weight mapping:** Maps gap integer levels to weights (0 gap = 5 weight, etc.).
* **Total Score:** $Total_i = 0.6 \cdot CF_i + 0.4 \cdot SF_i$ (where CF/SF is average weight of Core/Secondary criteria).

### AHP (Analytic Hierarchy Process)
* **Eigenvector weights:** Priority vector is calculated from the normalized column average of the pairwise comparison matrix.
* **Consistency Check:** Calculates Consistency Index (CI) and Ratio (CR). Consistent if $CR < 0.1$.

### MOORA (Multi-Objective Optimization on the basis of Ratio Analysis)
* **Normalization ($R_{ij}$):** $R_{ij} = x_{ij}/\sqrt{\sum x_{kj}^2}$
* **Optimization Value ($y_i$):** $y_i = \sum_{j \in Benefit} V_{ij} - \sum_{j \in Cost} V_{ij}$ where $V_{ij} = R_{ij} \cdot w_j$.
