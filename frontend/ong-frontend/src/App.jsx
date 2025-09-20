import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Adoption from './pages/Adoption';
import DogDetail from './pages/DogDetail';
import Donations from './pages/Donations';
import Volunteer from './pages/Volunteer';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDogs from './pages/admin/Dogs';
import AdminBlog from './pages/admin/Blog';
import AdminAdoptions from './pages/admin/Adoptions';
import AdminVolunteers from './pages/admin/Volunteers';
import AdminDonations from './pages/admin/Donations';
import AdminContacts from './pages/admin/Contacts';
import AdminUsers from './pages/admin/Users';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sobre" element={<About />} />
                    <Route path="/adocao" element={<Adoption />} />
                    <Route path="/adocao/:id" element={<DogDetail />} />
                    <Route path="/doacoes" element={<Donations />} />
                    <Route path="/voluntariado" element={<Volunteer />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/contato" element={<Contact />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
            
            {/* Rotas administrativas */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/caes" element={<AdminDogs />} />
                  <Route path="/usuarios" element={<AdminUsers />} />
                  <Route path="/blog" element={<AdminBlog />} />
                  <Route path="/adocoes" element={<AdminAdoptions onStatusChange={() => {
                    // Força reload da lista de cães se AdminDogs estiver montado
                    const evt = new CustomEvent('reload-dogs');
                    window.dispatchEvent(evt);
                  }} />} />
                  <Route path="/voluntarios" element={<AdminVolunteers />} />
                  <Route path="/doacoes" element={<AdminDonations />} />
                  <Route path="/contatos" element={<AdminContacts />} />
                </Routes>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
