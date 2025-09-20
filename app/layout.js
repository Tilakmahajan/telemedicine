import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Telemedicine App",
  description: "Telemedicine platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
