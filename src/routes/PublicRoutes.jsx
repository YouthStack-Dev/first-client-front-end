import { Route } from "react-router-dom";
import { GuestRoute } from "../middleware/GuestRoute";
import { Login } from "../pages/Login";
import MLTCorporateLandingPage from "../pages/MLTCorporateLandingPage";
import { PrivacyPolicy } from "../pages/PrivacyPolicy";

export const PublicRoutes = () => (
  <>
    <Route
      path="/landing"
      element={
        <MLTCorporateLandingPage />
      }
    />
    <Route
      path="/"
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />

    <Route
      path="/vendor"
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />
    <Route
      path="/superadmin"
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />
    <Route
      path="/docs"
      element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      }
    />
    <Route
      path="/privacy-policy"
      element={<PrivacyPolicy />}
    />
  </>
);

