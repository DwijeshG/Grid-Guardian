# Grid Guardian Web

![Grid Guardian Banner](https://picsum.photos/seed/security/1200/400?blur=2)

**Grid Guardian Web** is a high-performance, AI-powered security monitoring and threat intelligence dashboard. Built for security professionals and power users, it provides a real-time, hardware-inspired interface for tracking system health, managing defensive shields, and analyzing global threat intelligence.

---

## 🛡️ Key Features

- **AI-Powered Threat Analysis**: Integrates with **Google Gemini** for real-time neural analysis of potential security risks and system behavior.
- **Hybrid Security Engine**: Combines local heuristic scanning, signature-based detection, and cloud-based intelligence.
- **Advanced URL & Hash Scanning**: Native integration with **VirusTotal**, **Google Safe Browsing**, and **abuse.ch** (URLhaus, MalwareBazaar) for deep file and link inspection.
- **Real-Time System Monitoring**: Live tracking of CPU, RAM, and GPU resources, plus network telemetry (IP geolocation, VPN/Proxy detection).
- **Threat Intelligence Feed**: Live global security event tracking and interactive threat map.
- **Quantum-Ready Architecture**: Support for post-quantum cryptography (PQC) standards like Kyber and Dilithium (NIST FIPS 203/204).
- **Neural Inference Engine**: Leverages **TensorFlow.js** for local, client-side threat scoring and reinforcement learning.
- **Responsive Hardware Aesthetic**: A custom-built, high-density interface using Tailwind CSS and Framer Motion for a professional "mission control" feel.

---

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **Database**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **AI/ML**: [Google GenAI (Gemini)](https://ai.google.dev/), [TensorFlow.js](https://www.tensorflow.org/js)
- **Animations**: [Motion](https://motion.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/grid-guardian-web.git
cd grid-guardian-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your API keys:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# abuse.ch API Key (Optional)
VITE_ABUSE_CH_KEY=your_abuse_ch_key_here

# Server Configuration
PORT=3000
```

### 4. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```text
├── public/             # Static assets (WASM files, icons)
├── src/
│   ├── components/     # Reusable UI components
│   ├── services/       # API and AI integration logic
│   ├── App.jsx         # Main application entry
│   ├── index.css       # Global styles & Tailwind configuration
│   └── main.jsx        # React DOM mounting
├── server.js           # Express backend server
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

---

## 📜 License & Copyright

**Copyright © 2026 Defensive Grid Labs. All rights reserved.**

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for feature requests and bug reports.

---

*Built with precision for the post-quantum era.*
