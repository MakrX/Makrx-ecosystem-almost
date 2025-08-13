import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./lib/theme-clean";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Ecosystem from "./pages/Ecosystem";
import Makerspaces from "./pages/Makerspaces";
import Store from "./pages/Store";
import ServiceProviders from "./pages/ServiceProviders";
import ThreeDStore from "./pages/ThreeDStore";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import Docs from "./pages/Docs";
import Support from "./pages/Support";
import Status from "./pages/Status";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import ThemeDemo from "./pages/ThemeDemo";
import { Helmet } from "react-helmet-async";

const App = () => {
  return (
    <ThemeProvider>
      <Helmet>
        <script>
          {`
            (function() {
              try {
                var theme = localStorage.getItem('makrx-theme') || 'system';
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

                document.documentElement.classList.add(resolvedTheme);
                document.documentElement.setAttribute('data-theme', resolvedTheme);
                document.documentElement.style.colorScheme = resolvedTheme;
              } catch (e) {
                console.warn('Theme initialization failed:', e);
              }
            })();
          `}
        </script>
        <title>
          MakrX - Digital Manufacturing Ecosystem | Makerspaces, Tools &
          Fabrication
        </title>
        <meta
          name="description"
          content="India's leading digital manufacturing platform connecting creators, makerspaces, and service providers. Access MakrCave makerspaces, shop at MakrX.Store, and get custom fabrication through 3D.MakrX.Store."
        />
        <meta
          name="keywords"
          content="makerspace, digital manufacturing, 3d printing, laser cutting, custom fabrication, tools, india, makrx"
        />
        <meta
          property="og:title"
          content="MakrX - Digital Manufacturing Ecosystem"
        />
        <meta
          property="og:description"
          content="India's leading digital manufacturing platform connecting creators, makerspaces, and service providers."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://makrx.org" />
        <meta property="og:image" content="https://makrx.org/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@makrx" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://makrx.org" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1e40af" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0a"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          {/* Skip Link for Accessibility */}
          <a
            href="#main-content"
            className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-makrx-yellow focus:text-makrx-blue focus:rounded-md focus:font-semibold"
          >
            Skip to main content
          </a>
          <Header />

          <main id="main-content" className="flex-1 pt-16 md:pt-20" role="main">
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/makerspaces" element={<Makerspaces />} />
              <Route path="/store" element={<Store />} />
              <Route path="/service-providers" element={<ServiceProviders />} />
              <Route path="/3d" element={<ThreeDStore />} />

              {/* Content Pages */}
              <Route path="/events" element={<Events />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/support" element={<Support />} />
              <Route path="/status" element={<Status />} />

              {/* Company Pages */}
              <Route path="/careers" element={<Careers />} />
              <Route path="/about" element={<About />} />
              <Route path="/press" element={<Press />} />
              <Route path="/contact" element={<Contact />} />

              {/* Theme Demo (Development) */}
              <Route path="/theme-demo" element={<ThemeDemo />} />

              {/* Legal Pages */}
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />

              {/* Legacy redirects */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* 404 and 500 custom pages */}
              <Route path="/404" element={<NotFound />} />
              <Route path="/500" element={<NotFound />} />

              {/* Catch-all route for 404 - MUST be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
