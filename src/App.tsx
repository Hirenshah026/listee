import { BrowserRouter as Router, Routes, Route } from "react-router";
import ProtectedRoute from "./components/pr/ProtectedRoute";
import StaffProtectedRoute from "./components/pr/StaffProtectedRoute";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
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
import AstrologerPage from "./astrologer/AstrologerPage";
import HomePage from "./astrologer/HomePage";
import ProfilePage from "./astrologer/ProfilePage";
import ChatPage from "./astrologer/ChatPage";
import AstrologerChatPage from "./astrologer/AstrologerChatPage";
export default function App() {
  return (
    <Router >
      <ScrollToTop />
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="chat" element={<Chat />} />

        <Route path="staff/login" element={<StaffLogin />} />
        <Route path="staff/forgot-password" element={<StaffForgotPassword />} />
        <Route path="user/login" element={<MobileAuth />} />
        <Route path="astro/register" element={<AstrologerRegister />} />
        <Route path="astro/login" element={<AstrologerLogin />} />
        <Route path="astro/logout" element={<AstrologerLogin />} />
        <Route path="astro/list" element={<AstrologerPage />} />
        <Route path="astro/home" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="astro/profile" element={<ProfilePage />} />
        <Route path="astro/chat" element={<ChatPage />} />
        <Route path="astro/chat/user" element={<AstrologerChatPage />} />
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
          <Route path="form-elements" element={<FormElements />} />
          <Route path="basic-tables" element={<BasicTables />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="avatars" element={<Avatars />} />
          <Route path="badge" element={<Badges />} />
          <Route path="buttons" element={<Buttons />} />
          <Route path="images" element={<Images />} />
          <Route path="videos" element={<Videos />} />
          <Route path="line-chart" element={<LineChart />} />
          <Route path="bar-chart" element={<BarChart />} />
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

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

  );
}
