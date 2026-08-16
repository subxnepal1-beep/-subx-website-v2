# SubX Nepal - Premium Digital Subscriptions Store

![SubX Nepal](public/logo-official.png)

**SubX Nepal** is Nepal's premier digital subscription ecommerce web application. It provides instant access to genuine subscriptions (Netflix, YouTube Premium, ChatGPT Plus, CapCut Pro, Spotify, and more) with instant WhatsApp delivery, eSewa/Khalti payment support, and a comprehensive Admin Management Panel.

---

## 🚀 Key Features

- 🛒 **Interactive Product Store**: Browse subscriptions with category filtering, search, and detailed plan selections.
- 💬 **Direct WhatsApp Checkout**: Automated formatted message generation for seamless instant order processing via WhatsApp.
- 🔐 **Admin Management Panel**: Secure PIN-protected dashboard (`9800`) to manage products, pricing, stock status, categories, site branding, and customer reviews.
- 🤖 **AI Assistant Chatbot**: Integrated customer support bot for fast answers about pricing, payment methods, and delivery times.
- 💳 **Local Payment Integration**: Built-in instructions and automated payment verification for eSewa, Khalti, IME Pay, and Bank Transfer.
- 🌟 **Customer Reviews & Ratings**: Live feedback display and customer submission form with admin moderation.
- 📱 **Fully Responsive & Fast**: Optimized mobile-first experience built with React 19, Vite, and Tailwind CSS.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion
- **Database / Backend (Optional)**: Supabase Integration Ready

---

## 💻 Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/subx-nepal.git
   cd subx-nepal
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables** (Optional):
   Copy `.env.example` to `.env` and fill in any required variables:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to GitHub Pages

This project is pre-configured with a GitHub Actions workflow for automatic deployment to GitHub Pages upon pushing to the `main` branch.

### Automatic Deployment (GitHub Actions)

1. Push your repository to GitHub.
2. In your GitHub repository settings, navigate to **Pages** (under Code and automation).
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push any changes to `main` branch — GitHub Actions will automatically build and deploy your site!

### Manual Deployment (Vercel / Netlify)

- **Vercel**: Connect your GitHub repository to Vercel. Standard Vite configuration will be detected automatically (with `vercel.json` rewrite configured).
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.

---

## 🔒 Default Admin Credentials

- **Admin Access**: Click on **Admin Panel** in the site header or footer.
- **Default PIN**: `9800` *(Can be modified inside the Admin Panel settings)*

---

## 📄 License

This project is licensed under the MIT License.
