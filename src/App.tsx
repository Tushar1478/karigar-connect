import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { SignupCustomer, SignupKarigar } from "./pages/Signup";
import CustomerDashboard from "./pages/CustomerDashboard";
import KarigarProfile from "./pages/KarigarProfile";
import MyBookings from "./pages/MyBookings";
import KarigarDashboard from "./pages/KarigarDashboard";
import KarigarProfileEdit from "./pages/KarigarProfileEdit";
import CustomerProfile from "./pages/CustomerProfile";
import NotFound from "./pages/NotFound";
import AIChatbot from "./components/AIChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BookingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/signup/customer" element={<SignupCustomer />} />
              <Route path="/signup/karigar" element={<SignupKarigar />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/karigar/:id" element={<KarigarProfile />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/karigar-dashboard" element={<KarigarDashboard />} />
              <Route path="/karigar-profile-edit" element={<KarigarProfileEdit />} />
              <Route path="/customer-profile" element={<CustomerProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </BookingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
