import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { AppView } from '../types';

interface LegalLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, onBack, children }) => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto w-full animate-fade-in min-h-screen">
    <button 
      onClick={onBack}
      className="flex items-center text-quicksand hover:text-swanwing transition-colors font-bold mb-6"
    >
      <ChevronLeft size={20} className="mr-1" /> Back
    </button>
    
    <div className="bg-sapphire/10 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-sapphire/30 shadow-xl">
      <h1 className="text-3xl md:text-4xl font-bold serif text-swanwing mb-8 border-b border-sapphire/30 pb-4">{title}</h1>
      <div className="prose prose-invert prose-p:text-shellstone prose-headings:text-swanwing prose-strong:text-quicksand prose-a:text-quicksand max-w-none text-sm md:text-base leading-relaxed space-y-4">
        {children}
      </div>
    </div>
    
    <div className="mt-8 text-center text-xs text-shellstone/50">
        Last Updated: October 2025 • London Mixologist Ltd.
    </div>
  </div>
);

interface PageProps {
  onNavigate: (view: AppView) => void;
}

export const CookiePolicy: React.FC<PageProps> = ({ onNavigate }) => (
  <LegalLayout title="Cookie Policy" onBack={() => onNavigate(AppView.DASHBOARD)}>
    <p><strong>Effective Date:</strong> October 24, 2025</p>
    
    <h3>1. Introduction</h3>
    <p>London Mixologist ("we", "us", or "our") uses cookies and similar tracking technologies to enhance your experience on our application. This policy explains what cookies are, how we use them, and your choices regarding them.</p>

    <h3>2. What are Cookies?</h3>
    <p>Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit certain websites. They allow the application to remember your actions and preferences over a period of time.</p>

    <h3>3. How We Use Cookies</h3>
    <p>We use cookies for the following purposes:</p>
    <ul>
      <li><strong>Essential Cookies:</strong> These are necessary for the app to function properly. They include cookies that enable you to log in to secure areas (Auth Token) and remember your age verification status (`london_mixologist_age_verified`).</li>
      <li><strong>Preferences:</strong> These cookies allow us to remember your settings, such as your preferred theme (Light/Dark mode).</li>
      <li><strong>Analytics:</strong> We may use third-party analytics to understand how users interact with our app to improve functionality. Data collected is aggregated and anonymous.</li>
    </ul>

    <h3>4. Managing Your Cookies</h3>
    <p>Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.</p>
    
    <h3>5. Changes to This Policy</h3>
    <p>We may update this Cookie Policy from time to time. We encourage you to review this page periodically for any changes.</p>
  </LegalLayout>
);

export const PrivacyPolicy: React.FC<PageProps> = ({ onNavigate }) => (
  <LegalLayout title="Privacy Policy" onBack={() => onNavigate(AppView.DASHBOARD)}>
    <p><strong>Effective Date:</strong> October 24, 2025</p>

    <h3>1. Introduction</h3>
    <p>London Mixologist is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

    <h3>2. Information We Collect</h3>
    <p>We collect the following types of information:</p>
    <ul>
      <li><strong>Account Information:</strong> Name, email address, password, and profile picture when you register.</li>
      <li><strong>Usage Data:</strong> Information about how you use our app, including recipes generated and saved.</li>
      <li><strong>User Content:</strong> Photos you upload to the "Cocktail Vision" feature. Note: Images are processed by our AI partners (Google Gemini) and are not permanently stored by us after analysis unless saved to your history.</li>
      <li><strong>Affiliate Data:</strong> If you join our affiliate program, we collect your Amazon Associate ID.</li>
    </ul>

    <h3>3. How We Use Your Information</h3>
    <p>We use your data to:</p>
    <ul>
      <li>Provide, maintain, and improve our services.</li>
      <li>Process your subscription payments (via Stripe).</li>
      <li>Personalize your experience (e.g., recipe history).</li>
      <li>Communicate with you regarding updates or security alerts.</li>
    </ul>

    <h3>4. Data Sharing</h3>
    <p>We do not sell your personal data. We may share data with:</p>
    <ul>
      <li><strong>Service Providers:</strong> Cloud hosting, payment processors (Stripe), and AI providers (Google) necessary to operate the service.</li>
      <li><strong>Legal Obligations:</strong> If required by law or to protect our rights.</li>
    </ul>

    <h3>5. Your Rights</h3>
    <p>Under the UK GDPR, you have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you.</li>
      <li>Request correction of inaccurate data.</li>
      <li>Request deletion of your data ("Right to be forgotten").</li>
      <li>Withdraw consent at any time.</li>
    </ul>
    <p>To exercise these rights, please contact us at privacy@londonmixologist.app.</p>
  </LegalLayout>
);

export const TermsAndConditions: React.FC<PageProps> = ({ onNavigate }) => (
  <LegalLayout title="Terms & Conditions" onBack={() => onNavigate(AppView.DASHBOARD)}>
    <p><strong>Effective Date:</strong> October 24, 2025</p>

    <h3>1. Acceptance of Terms</h3>
    <p>By accessing or using London Mixologist, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the service.</p>

    <h3>2. Age Restriction</h3>
    <p>You must be of legal drinking age in your country of residence (18+ in the UK) to use this application. By using the app, you warrant that you meet this requirement.</p>

    <h3>3. Use of Service</h3>
    <p>You agree to use the application for lawful purposes only. You must not use the AI generation features to create illegal, harmful, or offensive content.</p>

    <h3>4. Intellectual Property</h3>
    <p>The design, code, and branding of London Mixologist are owned by us. Recipes generated by AI are provided for your personal use. You retain rights to any original photos you upload.</p>

    <h3>5. Subscription & Payments</h3>
    <p>Premium features are available via a monthly subscription. Payments are processed securely via Stripe. You may cancel your subscription at any time via your user dashboard.</p>

    <h3>6. Limitation of Liability</h3>
    <p>London Mixologist provides recipe suggestions for entertainment purposes only. We are not liable for:</p>
    <ul>
      <li>Any health issues resulting from the consumption of alcohol or ingredients suggested.</li>
      <li>Inaccuracies in AI-generated content (including allergen information).</li>
      <li>Third-party products purchased via affiliate links.</li>
    </ul>

    <h3>7. Governing Law</h3>
    <p>These terms are governed by the laws of England and Wales.</p>
  </LegalLayout>
);

export const Disclaimer: React.FC<PageProps> = ({ onNavigate }) => (
  <LegalLayout title="Disclaimer" onBack={() => onNavigate(AppView.DASHBOARD)}>
    <h3>1. Drink Responsibly</h3>
    <p>London Mixologist advocates for responsible drinking. Never drink and drive. Know your limits. For information and support, visit <a href="https://www.drinkaware.co.uk" target="_blank" rel="noreferrer">drinkaware.co.uk</a>.</p>

    <h3>2. AI-Generated Content Warning</h3>
    <p>The recipes, images, and nutritional estimates provided by this application are generated by Artificial Intelligence (Google Gemini). While we strive for accuracy, AI can make errors (hallucinations).</p>
    <p><strong>Allergies:</strong> The AI may not always identify or declare allergens present in specific ingredients. Always check the labels of the actual products you are using.</p>

    <h3>3. Affiliate Disclosure</h3>
    <p>London Mixologist is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.co.uk.</p>
    <p>When you click on links to various merchants on this site and make a purchase, this can result in this site earning a commission. Affiliate programs and affiliations include, but are not limited to, the eBay Partner Network and Amazon Associates.</p>
    
    <h3>4. Not Professional Advice</h3>
    <p>Content on this app is for entertainment and informational purposes only and does not constitute professional medical, nutritional, or mixology advice.</p>
  </LegalLayout>
);
