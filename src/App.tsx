import { HashRouter as Router, Routes, Route } from "react-router";
import { Outlet } from "react-router-dom"
import ProtectedRoute from "./components/pr/ProtectedRoute";
import StaffProtectedRoute from "./components/pr/StaffProtectedRoute";
import AstroProtectedRoute from "./components/pr/AstroProtectedRoute";
import UserProtectedRoute from "./components/pr/UserProtectedRoute";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";

import { ScrollToTop } from "./components/common/ScrollToTop";

// Admin Roles Pages
import RolesList from "./admin/pages/roles/RolesList";

import DoctorList from "./admin/pages/doctors/DoctorList";
import AddDoctor from "./admin/pages/doctors/AddDoctor";
import EditDoctor from "./admin/pages/doctors/EditDoctor";
import CityList from "./admin/pages/city/CityList";
import AreaList from "./admin/pages/city/AreaList";
import StaffManagement from "./admin/pages/doctors/StaffManagement";
import MarketingPersonList from "./admin/pages/doctors/MarketingPersonList";

import StaffLogin from "./staff/auth/StaffLogin";
import StaffForgotPassword from "./staff/auth/StaffForgotPassword";
import StaffDashboard from "./staff/StaffDashboard";
import Chat from "./pages/Chats";
import QuestionPage from "./admin/pages/question/QuestionPage";
// import StaffLogin from "./staff/auth/StaffLogin";
import MobileAuth from "./chatuser/MobileAuth";
import AstrologerRegister from "./astrologer/AstrologerRegister";
import AstrologerLogin from "./astrologer/AstrologerLogin";
import AstrologerPage from "./astronew/AstrologerPage";
import HomePage from "./astronew/HomePage2";
import ProfilePage from "./astronew/ProfilePage";
import UserProfile from "./astronew/UserProfile";
import ChatPage from "./astronew/ChatPage";
import UserChatPage from "./astronew/UserChatPage";
import AstrologerChatPage from "./astronew/AstrologerChatPage";
import AstroLiveHost from "./astronew/AstroLiveHost";
import UserLiveList from "./astronew/UserLiveList";
import LiveCallPage from "./astronew/LiveCallPage";
import PanchangPage from "./astronew/PanchangPage";
import CallPage from "./astronew/CallPage";
import H1 from "./astronew/newPage/AstrologerList";
import AstrologerList from "./astronew/newPage/AstrologerList";
import AstroPublicProfile from "./astronew/AstroPublicProfile";

export default function App() {
  return (
    <Router >
      <ScrollToTop />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/new-page" element={<H1 />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="chat" element={<Chat />} />

        <Route path="staff/login" element={<StaffLogin />} />
        <Route path="staff/forgot-password" element={<StaffForgotPassword />} />
        <Route path="user/login" element={<MobileAuth />} />
        <Route path="astro/register" element={<AstrologerRegister />} />
        <Route path="astro/login" element={<AstrologerLogin />} />
        <Route path="astro/logout" element={<AstrologerLogin />} />
        
        <Route path="astro/home" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />        
        <Route path="astro/all-list" element={<AstrologerList />} />
        <Route path="astro/panchang" element={<PanchangPage />} />
        <Route path="call" element={<CallPage />} />
        {/* PROTECTED ROUTES */}
        <Route
          path="/doctor-panel/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested routes rendered inside AppLayout */}
          <Route index element={<Home />} />
          <Route path="profile" element={<UserProfiles />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="blank" element={<Blank />} />
          
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route path="roles" element={<RolesList />} />

          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/add" element={<AddDoctor />} />
          <Route path="doctors/edit/:id" element={<EditDoctor />} />
          <Route path="city-management/" element={<CityList />} />
          <Route path="area-management/" element={<AreaList />} />
          <Route path="marketing-persons-management/" element={<MarketingPersonList />} />
          <Route path="staff-management/" element={<StaffManagement />} />
          <Route path="question-management/" element={<QuestionPage />} />
          {/* aur admin related nested pages */}
        </Route>

        <Route
          path="/staff/*"
          element={
            <StaffProtectedRoute>
              <AppLayout />
            </StaffProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboard />} />

        </Route>
        <Route
          path="/astro/*"
          element={
            <AstroProtectedRoute>
              <Outlet />
            </AstroProtectedRoute>
          }
        >
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chat/user" element={<AstrologerChatPage />} />
          <Route path="live" element={<AstroLiveHost />} />

        </Route>
        <Route
          path="/user/*"
          element={
            <UserProtectedRoute>
              <Outlet />
            </UserProtectedRoute>
          }
        >
          <Route path="profile" element={<UserProfile />} />
          <Route path="astro/chat" element={<ChatPage />} />
          <Route path="astro/my-chat" element={<UserChatPage />} />       
          <Route path="astro/list" element={<AstrologerPage />} />
          <Route path="astro/live/user" element={<UserLiveList />} />
          <Route path="live-call/:astroId" element={<LiveCallPage />} />
          <Route path="view/astro" element={<AstroPublicProfile />} />

        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

  );
}

