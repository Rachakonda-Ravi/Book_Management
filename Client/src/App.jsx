import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './ThemeContext';
import Books from './Books';
import CreateBook from './CreateBook'; 
import UpdateBook from './UpdateBook';
import Profile from './Profile';
import Nav from './Nav';
import Login from './Login';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Nav />
        <Routes>
          <Route path="/" element={<Books />} />
          <Route path="/create" element={<CreateBook />} />
          <Route path="/update" element={<UpdateBook />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
