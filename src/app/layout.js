import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WorkoutProvider } from "./context/WorkoutContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ExerciseTemplateProvider } from "./context/ExerciseTemplateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fitness Tracker",
  description: "Track your workouts and achieve your fitness goals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
