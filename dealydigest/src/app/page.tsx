"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import KnotLink from "@/components/knot-link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/animated-background";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
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
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatedBackground />
      <motion.div
        className="flex flex-col items-center justify-center py-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          className="mb-6 text-4xl font-bold text-primary"
          variants={itemVariants}
        >
          Welcome to DealyDigest
        </motion.h1>
        
        <motion.p 
          className="mb-10 max-w-2xl text-center text-lg text-gray-600"
          variants={itemVariants}
        >
          Your personalized platform for discovering the best deals tailored to
          your preferences and spending habits.
        </motion.p>

        {isLoading ? (
          <motion.div 
            className="flex items-center justify-center"
            variants={itemVariants}
          >
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </motion.div>
        ) : user ? (
          <motion.div 
            className="flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.p 
              className="mb-4 text-xl font-medium"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Welcome back, {user.name || user.email}!
            </motion.p>

            <motion.div
              className="w-full"
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <KnotLink />
            </motion.div>

            <motion.div 
              className="flex gap-4 mt-4"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="btn-pulse"
              >
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors duration-300 inline-block"
                >
                  Go to Dashboard
                </Link>
              </motion.div>
              
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href="/deals"
                  className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-gray-100 transition-colors duration-300 inline-block"
                >
                  View Deals
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.p 
              className="mb-4 text-xl font-medium"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Sign up or log in to get started
            </motion.p>
            
            <motion.div 
              className="flex gap-4"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.a
                href="/api/auth/login?screen_hint=signup"
                className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors duration-300 btn-pulse"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Sign Up
              </motion.a>
              
              <motion.a
                href="/api/auth/login"
                className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-gray-100 transition-colors duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Log In
              </motion.a>
            </motion.div>
          </motion.div>
        )}
        
        <motion.div 
          className="absolute bottom-4 floating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="text-sm text-gray-400">Discover exclusive deals just for you</div>
        </motion.div>
      </motion.div>
    </>
  );
}
