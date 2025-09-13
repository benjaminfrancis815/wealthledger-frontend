import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import ExpenseList from './components/ExpenseList';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      {/* <ExpenseList /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/expenses" element={<ExpenseList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
