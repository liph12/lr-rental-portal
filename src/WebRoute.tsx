import { Route, Routes } from "react-router-dom";
import Overview from "./pages/Overview";
import Reports from "./pages/Reports/Index";
import TeamReport from "./pages/Reports/Team";
import AppLayout from "./components/layouts/AppLayout";
import PinningTracker from "./pages/PinningTracker/Index";
import ClustersProgress from "./pages/PinningTracker/ClustersProgress";
import Login from "./pages/Auth/Login";
import { useAppContext } from "./providers/AppProvider";
import ErrorPage from "./pages/ErrorPage";

function WebRoute() {
  const { user } = useAppContext();

  return (
    <Routes>
      {user ? (
        <Route path="/" element={<AppLayout />}>
          <Route path="" element={<Overview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:team_id" element={<TeamReport />} />
          <Route path="pinning-tracker" element={<PinningTracker />}>
            <Route path=":rm_id" element={<ClustersProgress />} />
          </Route>
        </Route>
      ) : (
        <Route path="/login" element={<Login />} />
      )}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default WebRoute;
