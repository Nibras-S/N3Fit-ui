import React from "react";
import { motion } from "framer-motion";
import Header from "../components/static/components/header/Header";
import Program from "../components/static/components/program/Program";
import Navbar from "../components/static/components/navbar/Navbar";
import Class from "../components/static/components/class/Class";
import Price from "../components/static/components/pricing/Price";
import SocialProof from "../components/static/components/social/SocialProof";
import RevealSection from "../components/RevealSection";
import "../components/static/landing.css";
import "./pageHome.css";

const revealVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function PageHome() {
  return (
    <div className="min-h-screen font-sans">
      <div className="landing-page-wrapper">
        <Navbar />
        <RevealSection variant={revealVariants} transition={{ duration: 0.45 }}>
          <Header />
        </RevealSection>
        <RevealSection variant={revealVariants} transition={{ duration: 0.45 }}>
          <SocialProof />
        </RevealSection>
        <RevealSection variant={revealVariants} transition={{ duration: 0.45 }}>
          <Program />
        </RevealSection>
        <RevealSection variant={revealVariants} transition={{ duration: 0.45 }}>
          <Class />
        </RevealSection>
        <RevealSection variant={revealVariants} transition={{ duration: 0.45 }}>
          <Price />
        </RevealSection>
      </div>
    </div>
  );
}

export default PageHome;
