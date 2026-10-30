import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Research from "./pages/Research";
import Publications from "./pages/Publications";
import Teaching from "./pages/Teaching";
import Lab from "./pages/Lab";
import Contact from "./pages/Contact";
import Questions from "./pages/Questions";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="research" element={<Research />} />
        <Route path="publications" element={<Publications />} />
        <Route path="teaching" element={<Teaching />} />
        <Route path="lab" element={<Lab />} />
        <Route path="contact" element={<Contact />} />
        <Route path="questions" element={<Questions />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
