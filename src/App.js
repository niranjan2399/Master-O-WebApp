import { Routes, Route } from "react-router-dom";
import CarGame from "./containers/CarGame";
import CustomReport from "./containers/CustomReport";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CarGame />} />
        <Route path="/custom-report" element={<CustomReport />} />
      </Routes>
    </>
  );
}

export default App;
