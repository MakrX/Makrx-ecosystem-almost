import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Building2,
  ShoppingCart,
  GraduationCap,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ChevronRight,
  Award,
  TrendingUp,
  Heart,
} from "lucide-react";
// Feature flags removed - using default behavior
import SEOStructuredData from "../components/SEOStructuredData";
// Remove useTheme import since we'll use only Tailwind classes
// AppLauncher removed - simplified for public gateway

interface StatCardProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, icon }) => {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Extract the numeric part from the string (e.g., "50+" -> 50)
  const targetNumber = parseInt(number.replace(/\D/g, "")) || 0;
  const suffix = number.replace(/\d/g, "");

  // Format number for display (e.g., 10000 -> "10K")
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
    }
    return num.toString();
  };

  // Get display text based on the current number
  const getDisplayText = () => {
    if (targetNumber >= 1000) {
      // For large numbers, always format
      return formatNumber(displayNumber);
    } else {
      // For small numbers, show number + suffix
      return displayNumber + suffix;
    }
  };

  useEffect(() => {
    const startAnimation = () => {
      if (hasAnimated) return;
      setHasAnimated(true);

      const duration = 2000;
      const startTime = performance.now();

      const animateNumber = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * targetNumber);

        setDisplayNumber(current);

        if (progress < 1) {
          requestAnimationFrame(animateNumber);
        } else {
          setDisplayNumber(targetNumber);
        }
      };

      requestAnimationFrame(animateNumber);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Fallback: start animation after 3 seconds if not triggered
    const fallbackTimer = setTimeout(() => {
      startAnimation();
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [targetNumber, hasAnimated]);

  return (
    <div ref={ref} className="text-center group">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-makrx-yellow/20 rounded-2xl flex items-center justify-center group-hover:bg-makrx-yellow/30 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <div
        className="text-3xl font-bold text-white dark:text-gray-100 mb-2"
        aria-live="polite"
      >
        {getDisplayText()}
      </div>
      <div className="text-white/80 dark:text-gray-300">{label}</div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  href,
  gradient,
}) => {
  return (
    <Link to={href} className="group block">
      <div
        className={[
          "relative overflow-hidden rounded-2xl p-8 h-full transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:-rotate-1 border",
          "border-white/10 dark:border-slate-700",
          // background handled purely by Tailwind:
          "bg-gradient-to-br",
          gradient, // e.g. "from-blue-600 to-purple-700"
          "dark:from-slate-800 dark:to-slate-900", // dark variant
        ].join(" ")}
      >
        <div className="relative z-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
                          bg-white/20 group-hover:bg-white/30 dark:bg-makrx-yellow/20 dark:group-hover:bg-makrx-yellow/30"
          >
            <div className="text-white dark:text-makrx-yellow">{icon}</div>
          </div>

          <h3 className="text-xl font-bold mb-3 group-hover:text-makrx-yellow transition-colors duration-300 text-white dark:text-gray-100">
            {title}
          </h3>

          <p className="mb-4 leading-relaxed transition-colors duration-300 text-white/90 group-hover:text-white dark:text-gray-300 dark:group-hover:text-gray-100">
            {description}
          </p>

          <div className="flex items-center font-medium group-hover:text-makrx-yellow transition-all duration-300 text-white dark:text-gray-200">
            Explore{" "}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
          </div>
        </div>

        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-all duration-700
                        bg-white/10 group-hover:bg-white/20 dark:bg-makrx-yellow/10 dark:group-hover:bg-makrx-yellow/20"
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-all duration-700
                        bg-white/5 group-hover:bg-white/10 dark:bg-makrx-yellow/5 dark:group-hover:bg-makrx-yellow/10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
};

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  company,
}) => (
  <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-800">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-makrx-yellow fill-current" />
      ))}
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-12 h-12 bg-makrx-blue dark:bg-makrx-yellow rounded-full flex items-center justify-center text-white dark:text-makrx-blue font-bold mr-4">
        {author.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">
          {author}
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {role}, {company}
        </div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  // Simplified for public gateway - no complex state management needed
  const showStats = true;
  const showTestimonials = true;
  const showVideo = false;
  // Using only Tailwind classes now - no JS theme branching needed

  return (
    <div className="min-h-screen">
      {/* SEO Structured Data */}
      <SEOStructuredData type="organization" />
      <SEOStructuredData type="website" />
      <SEOStructuredData type="product" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-makrx-blue via-makrx-blue/90 to-purple-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 sm:mb-8">
            {/* Animated Logo/Brand */}
            <div className="mb-6 sm:mb-12">
              <div className="relative group mb-4 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-none relative z-10">
                  <span className="text-white dark:text-gray-100 hover:text-makrx-yellow transition-colors duration-500 cursor-default block sm:inline">
                    MakrX
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-makrx-yellow/20 to-transparent rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                </h1>
              </div>

              {/* Enhanced Dream. Make. Share. section */}
              <div className="relative dream-make-share-container">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-white/90 dark:text-gray-200 mb-8 leading-tight">
                  <div className="flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-8">
                    {/* Dream word with enhanced animations */}
                    <div
                      className="dream-word inline-block animate-slide-in-left cursor-default relative group"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <span className="relative z-10 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-medium">
                        Dream.
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-makrx-yellow/20 via-makrx-yellow/30 to-makrx-yellow/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    </div>

                    {/* Separator */}
                    <div
                      className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-makrx-yellow/60"
                      style={{
                        opacity: "0",
                        animation: "fadeIn 0.6s ease-out 0.7s forwards",
                      }}
                    ></div>

                    {/* Make word - central focus with enhanced styling */}
                    <div
                      className="make-word inline-block animate-slide-in-right cursor-default relative group"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <span className="relative z-10 bg-gradient-to-r from-makrx-yellow via-yellow-300 to-makrx-yellow bg-clip-text text-transparent font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                        Make.
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-makrx-yellow/20 via-makrx-yellow/30 to-makrx-yellow/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    </div>

                    {/* Separator */}
                    <div
                      className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-makrx-yellow/60"
                      style={{
                        opacity: "0",
                        animation: "fadeIn 0.6s ease-out 1.2s forwards",
                      }}
                    ></div>

                    {/* Share word with enhanced animations */}
                    <div
                      className="share-word inline-block animate-slide-in-left cursor-default relative group"
                      style={{ animationDelay: "0.8s" }}
                    >
                      <span className="relative z-10 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent font-medium">
                        Share.
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-makrx-yellow/20 via-makrx-yellow/30 to-makrx-yellow/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    </div>
                  </div>
                </div>

                {/* Simple animated underline */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-24 sm:w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-makrx-yellow to-transparent rounded-full"
                    style={{
                      opacity: "0",
                      animation: "fadeIn 0.8s ease-out 1.5s forwards",
                    }}
                  ></div>
                </div>

                {/* Static decoration particles */}
                <div
                  className="absolute -top-4 left-1/4 w-1 h-1 bg-makrx-yellow/40 dark:bg-makrx-yellow/60 rounded-full"
                  style={{
                    opacity: "0",
                    animation: "fadeIn 0.6s ease-out 2s forwards",
                  }}
                ></div>
                <div
                  className="absolute -top-2 right-1/3 w-1.5 h-1.5 bg-white/30 dark:bg-makrx-yellow/40 rounded-full"
                  style={{
                    opacity: "0",
                    animation: "fadeIn 0.6s ease-out 2.5s forwards",
                  }}
                ></div>
              </div>
            </div>

            <div className="inline-flex items-center px-6 py-3 rounded-full bg-makrx-yellow/20 dark:bg-makrx-yellow/30 text-makrx-yellow dark:text-makrx-yellow text-base sm:text-lg md:text-xl font-semibold mb-6 sm:mb-8">
              <Zap className="w-5 h-5 mr-3" />
              Welcome to the Future of Making
            </div>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-white/90 dark:text-gray-300 mb-6 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Access world-class makerspaces, shop cutting-edge tools, learn new
            skills, and bring your ideas to life. Join thousands of makers,
            innovators, and creators in the MakrX ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-16 px-4">
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl bg-makrx-yellow text-makrx-blue hover:bg-yellow-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Get Started Free</span>
              <Zap className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:rotate-12 transition-all duration-300 relative z-10" />
            </Link>

            <a
              href="/ecosystem"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">Explore Ecosystem</span>
              <Play className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 relative z-10" />
            </a>
          </div>

          {showVideo && (
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-black/20 rounded-2xl overflow-hidden backdrop-blur border border-white/20">
                <div className="w-full h-full flex items-center justify-center">
                  <button
                    className="w-20 h-20 bg-makrx-yellow rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors group"
                    aria-label="Play video about MakrX ecosystem"
                    onClick={() =>
                      alert(
                        "Video feature coming soon! This will showcase the MakrX ecosystem.",
                      )
                    }
                  >
                    <Play
                      className="w-8 h-8 text-makrx-blue ml-1 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              <p className="text-white/70 mt-4">
                Watch how MakrX is transforming the maker ecosystem
              </p>
            </div>
          )}
        </div>

        {/* Static Background Elements */}
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-makrx-yellow/10 dark:bg-makrx-yellow/20 rounded-full"
          style={{ opacity: "0", animation: "fadeIn 1s ease-out 2s forwards" }}
        />
        <div
          className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400/10 dark:bg-purple-400/20 rounded-full"
          style={{ opacity: "0", animation: "fadeIn 1s ease-out 3s forwards" }}
        />
        <div
          className="absolute top-1/3 right-20 w-12 h-12 bg-white/5 dark:bg-makrx-yellow/10 rounded-full"
          style={{ opacity: "0", animation: "fadeIn 1s ease-out 4s forwards" }}
        />
      </section>

      {/* Stats Section */}
      {showStats && (
        <section className="py-20 sm:py-24 lg:py-32 bg-makrx-blue dark:bg-makrx-blue-900 border-t border-makrx-blue-700 dark:border-makrx-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              <StatCard
                number="50+"
                label="Makerspaces"
                icon={<Building2 className="w-8 h-8 text-makrx-yellow" />}
              />
              <StatCard
                number="10000"
                label="Active Makers"
                icon={<Users className="w-8 h-8 text-makrx-yellow" />}
              />
              <StatCard
                number="1000000"
                label="Projects Created"
                icon={<Award className="w-8 h-8 text-makrx-yellow" />}
              />
              <StatCard
                number="25+"
                label="Cities"
                icon={<Globe className="w-8 h-8 text-makrx-yellow" />}
              />
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 sm:py-28 lg:py-36 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Everything You Need to
              <span className="text-makrx-blue dark:text-makrx-yellow transition-colors">
                {" "}
                Create
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              From idea to reality, MakrX provides the tools, space, knowledge,
              and community to bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="MakrCave"
              description="Access premium makerspaces with professional-grade equipment, from 3D printers to laser cutters, all in collaborative environments."
              icon={<Building2 className="w-6 h-6 text-white" />}
              href="/makrcave"
              gradient="from-blue-600 to-purple-700"
            />

            <FeatureCard
              title="MakrX Store"
              description="Shop curated tools, materials, and components. Get custom 3D printing services and expert recommendations for your projects."
              icon={<ShoppingCart className="w-6 h-6 text-white" />}
              href="/store"
              gradient="from-green-500 to-teal-600"
            />

            <FeatureCard
              title="Learn & Grow"
              description="Master new skills with hands-on workshops, online courses, and mentorship from experienced makers and industry experts."
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              href="/learn"
              gradient="from-orange-500 to-red-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-28 lg:py-36 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              How MakrX Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              Simple steps to transform your ideas into reality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-makrx-blue dark:bg-makrx-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-makrx-yellow group-hover:scale-110 transition-all">
                <span className="text-2xl font-bold text-white group-hover:text-makrx-blue transition-colors">
                  1
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Discover & Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Explore makerspaces near you, browse tools and materials, and
                plan your project with our expert community guidance.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-makrx-blue dark:bg-makrx-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-makrx-yellow group-hover:scale-110 transition-all">
                <span className="text-2xl font-bold text-white group-hover:text-makrx-blue transition-colors">
                  2
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create & Build
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Access professional equipment, get materials delivered, and
                build with support from experienced makers and mentors.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-makrx-blue dark:bg-makrx-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-makrx-yellow group-hover:scale-110 transition-all">
                <span className="text-2xl font-bold text-white group-hover:text-makrx-blue transition-colors">
                  3
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Share & Inspire
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Showcase your creations, inspire others, and become part of a
                thriving community of makers and innovators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-28 lg:py-36 bg-gradient-to-br from-gray-900 to-makrx-blue dark:from-slate-950 dark:to-slate-900 border-t border-gray-700 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose MakrX?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join the largest maker ecosystem in India with unmatched benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-makrx-yellow" />,
                title: "Premium Quality",
                description:
                  "Professional-grade equipment and materials with quality assurance",
              },
              {
                icon: <Users className="w-8 h-8 text-makrx-yellow" />,
                title: "Expert Community",
                description:
                  "Learn from and collaborate with experienced makers and professionals",
              },
              {
                icon: <Zap className="w-8 h-8 text-makrx-yellow" />,
                title: "Fast & Reliable",
                description:
                  "Quick access to spaces, fast delivery, and reliable service",
              },
              {
                icon: <Heart className="w-8 h-8 text-makrx-yellow" />,
                title: "Passionate Support",
                description:
                  "Dedicated support team that understands and shares your passion",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white/10 dark:bg-makrx-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 dark:group-hover:bg-makrx-yellow/20 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white dark:text-gray-100 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-white/80 dark:text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {showTestimonials && (
        <section className="py-24 sm:py-28 lg:py-36 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Loved by Makers
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                Hear from the amazing creators who are already part of the MakrX
                family
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Testimonial
                quote="MakrX transformed my startup journey. Access to professional 3D printers and laser cutters helped us prototype faster than ever."
                author="Priya Sharma"
                role="Founder"
                company="TechFlow Solutions"
              />
              <Testimonial
                quote="The community at MakrCave is incredible. I've learned more in 3 months than I did in years trying to figure things out alone."
                author="Rahul Mehta"
                role="Product Designer"
                company="Innovation Labs"
              />
              <Testimonial
                quote="From ordering materials to getting expert advice, everything is seamless. MakrX Store is now my go-to for all project needs."
                author="Anjali Gupta"
                role="Architect"
                company="Design Studio"
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 sm:py-28 lg:py-36 bg-gradient-to-r from-makrx-blue to-purple-700 dark:from-makrx-blue-800 dark:to-purple-900 border-t border-makrx-blue-700 dark:border-makrx-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12 leading-relaxed px-4">
            Join thousands of makers who are already bringing their ideas to
            life with MakrX. Your creative journey starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl bg-makrx-yellow text-makrx-blue hover:bg-yellow-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Get Started Free
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>

            <Link
              to="/learn"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              Explore Learning
              <GraduationCap className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* App Launcher Modal */}
      {/* AppLauncher removed for simplified public gateway */}
    </div>
  );
}
