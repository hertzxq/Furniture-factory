import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export function RevealSection(props: HTMLMotionProps<"section">) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  );
}
