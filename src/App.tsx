import { Route, Routes } from "react-router-dom";
import Overview from "./pages/Overview";
import Reports from "./pages/Reports/Index";
import TeamReport from "./pages/Reports/Team";
import { AppProvider } from "./providers/AppProvider";
import AppLayout from "./components/layouts/AppLayout";

function App() {
  return (
    <AppProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:team_id" element={<TeamReport />} />
        </Routes>
      </AppLayout>
    </AppProvider>
  );
}

export default App;
