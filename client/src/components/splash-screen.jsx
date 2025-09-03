import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
export default function SplashScreen(_a) {
    var onContinue = _a.onContinue;
    var _b = useState(false), isLoaded = _b[0], setIsLoaded = _b[1];
    useEffect(function () {
        var timer = setTimeout(function () {
            setIsLoaded(true);
        }, 1000);
        return function () { return clearTimeout(timer); };
    }, []);
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white cursor-pointer" onClick={onContinue}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        </div>

        {/* Content */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }} className="flex flex-col items-center space-y-8 z-10">
          {/* Logo */}
          <motion.div initial={{ rotateY: 0 }} animate={{ rotateY: 360 }} transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }} className="relative">
            <img src="/flame-logo.png" alt="GasFlow Logo" className="w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-2xl"/>
          </motion.div>

          {/* App Name */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              GasFlow
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-light">
              Your Trusted Gas Delivery Partner
            </p>
          </motion.div>

          {/* Features */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} className="text-center space-y-2">
            <p className="text-blue-200 text-sm md:text-base">✓ Fast & Reliable Delivery</p>
            <p className="text-blue-200 text-sm md:text-base">✓ Real-time Order Tracking</p>
            <p className="text-blue-200 text-sm md:text-base">✓ Schedule Regular Deliveries</p>
          </motion.div>
        </motion.div>

        {/* Tap to Continue Text */}
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: isLoaded ? 1 : 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="absolute bottom-20">
          <motion.p className="text-lg md:text-xl text-white/90 font-light" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            Tap anywhere to continue
          </motion.p>
        </motion.div>

        {/* Loading Indicator */}
        {!isLoaded && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-10">
            <div className="flex space-x-2">
              {[0, 1, 2].map(function (i) { return (<motion.div key={i} className="w-3 h-3 bg-white/60 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                    ease: "easeInOut"
                }}/>); })}
            </div>
          </motion.div>)}
      </motion.div>
    </AnimatePresence>);
}
