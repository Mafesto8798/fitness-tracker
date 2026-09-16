import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WorkoutProvider } from "./context/WorkoutContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ExerciseTemplateProvider } from "./context/ExerciseTemplateContext";
import RegisterServiceWorker from "./RegisterServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "My Fitness Log",
  description: "Track your workouts and achieve your fitness goals",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1abc9c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RegisterServiceWorker />
        <AuthProvider>
          <ToastProvider>
            <WorkoutProvider>
                <ExerciseTemplateProvider>{children}</ExerciseTemplateProvider>
              </WorkoutProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
