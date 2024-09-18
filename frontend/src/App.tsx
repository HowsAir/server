import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Landing from "./pages/Landing";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Landing />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
