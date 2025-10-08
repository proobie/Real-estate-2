import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import type { User } from "@supabase/supabase-js";
import Header from "../common/Header";
import Footer from "../common/Footer";
import LotliteLogo from "../../assets/lotlite-logo.png";

export default function ClientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-[#D3D3D3] to-[#f3f3f3] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          
          {/* Logo & Heading */}
          <div className="text-center">
            <div className="flex justify-center">
              <img src={LotliteLogo} alt="Lotlite Logo" className="h-16" />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-[#0B0B45]">
              Client Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to your dashboard. Here’s your profile information.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg border border-[#D3D3D3]">
            {loading ? (
              <p className="text-center text-gray-600 animate-pulse">
                Loading user info...
              </p>
            ) : user ? (
              <div className="space-y-4">
                {[
                  ["Name", user.user_metadata?.name || "N/A"],
                  ["Email", user.email],
                  ["Phone", user.user_metadata?.phone || "Not Provided"],
                  ["Role", user.user_metadata?.role || "client"],
                  [
                    "Joined",
                    new Date(user.created_at).toLocaleDateString(),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3"
                  >
                    <span className="font-semibold text-[#0B0B45] w-1/3">
                      {label}:
                    </span>
                    <span className="text-lg text-gray-900 w-2/3">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                No user data available.
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
