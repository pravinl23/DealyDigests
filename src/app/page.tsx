"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/animated-background";
import { MapPin, CreditCard, Brain, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  };

  const features = [
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Connect Your Cards",
      description:
        "Securely link your credit cards through Knot SDK to start tracking your spending patterns.",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description:
        "Our AI analyzes your transactions to provide personalized financial insights and recommendations.",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location-Based Deals",
      description:
        "Get real-time notifications about card benefits and deals at nearby merchants.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Smart Recommendations",
      description:
        "Receive suggestions on which cards to use for maximum rewards at different merchants.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Automatic Updates",
      description:
        "Your card preferences are automatically updated based on your spending patterns and location.",
    },
  ];

  if (!mounted) return null;

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <motion.div
          className="max-w-4xl mx-auto px-4 py-12 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <motion.h1
              className="text-5xl font-bold text-primary mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              DealyDigest
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Maximize your card rewards with AI-powered insights
            </motion.p>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 mb-16"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-200/10"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 * index }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div className="text-center" variants={itemVariants}>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="inline-block"
            >
              <Link
                href={user ? "/dashboard" : "/api/auth/login"}
                className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors duration-300 inline-flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    Get Started
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
