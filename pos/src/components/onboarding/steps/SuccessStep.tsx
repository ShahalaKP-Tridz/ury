import { motion } from "motion/react";
import { CheckCircle2, LayoutDashboard, Sparkles } from "lucide-react";
import type { OnboardingStepProps } from "../../../pages/onboarding/steps";

export function SuccessStep({ onNext }: OnboardingStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50 to-primary-100/50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 16 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-6 shadow-lg shadow-primary-200"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-gray-900" style={{ fontSize: "1.875rem", fontWeight: 700 }}>
                Setup Complete
              </h1>
              <span style={{ fontSize: "1.75rem" }}>🎉</span>
            </div>
            <p className="text-gray-500 mb-2" style={{ fontSize: "0.9375rem" }}>
              Your <span className="font-semibold text-primary-600">URY</span> restaurant system is ready to use.
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-3 gap-3 my-7"
          >
            {[
              { icon: <Sparkles className="w-4 h-4" />, label: "System Ready" },
              { icon: <LayoutDashboard className="w-4 h-4" />, label: "POS Active" },
              { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard Live" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-primary-50 rounded-xl p-3 flex flex-col items-center gap-1.5"
              >
                <div className="text-primary-600">{item.icon}</div>
                <span className="text-primary-700" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <button
              onClick={() => onNext()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm shadow-primary-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 mt-5"
            style={{ fontSize: "0.8125rem" }}
          >
            You can configure more settings anytime from your dashboard
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
