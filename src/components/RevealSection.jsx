import React from "react";
import { motion } from "framer-motion";

const defaultUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function RevealSection({
  children,
  className = "",
  variant = defaultUp,
  transition = { duration: 0.4 },
  once = true,
  ...props
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={variant}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export default RevealSection;
