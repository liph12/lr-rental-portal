import { AppProvider } from "./providers/AppProvider";
import WebRoute from "./WebRoute";

function App() {
  return (
    <AppProvider>
      <WebRoute />
    </AppProvider>
  );
}

export default App;
