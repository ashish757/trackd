import './App.css'
import './styles/custom.css'
import {Routes, Route} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import GuestRoute from "./components/GuestRoute.tsx";
import { useTokenRefreshOnLoad } from "./hooks/useTokenRefreshOnLoad.ts";
import {useDetectCountry} from "./hooks/useDetectCountry.ts";
import BottomNav from "./components/BottomNav.tsx";
import ToastListener from "./components/Toast/ToastListener.tsx";
import Home from "./pages/Home.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import DiscoverPage from "./pages/DiscoverPage.tsx";
import FindUsers from "./pages/FindUsers.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import ForgetPassword from "./pages/ForgetPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ChangeEmail from "./components/ChangeEmail.tsx";
import OauthSuccessPage from "./pages/OauthSuccessPage.tsx";
import { ProfilePageSkeleton, SettingsPageSkeleton, MyListPageSkeleton } from "./components/skeletons/index.ts";
import {Suspense, lazy} from "react";
import LoadingSpinner   from "./components/LoadingSpinner.tsx";
import ShareMovieModal from "./components/movieCards/ShareMovieModal.tsx";

const MyListPage =  lazy(() => import('./pages/MyListPage.tsx'));
const ProfilePage =  lazy(() => import('./pages/ProfilePage.tsx'));
const SettingsPage =  lazy(() => import('./pages/SettingsPage.tsx'));
const UserPage =  lazy(() => import('./pages/UserPage.tsx'));
const SigninPage =  lazy(() => import('./pages/SigninPage.tsx'));
const SignupPage =  lazy(() => import('./pages/SignupPage.tsx'));
const MovieInfoModal = lazy(() => import('./components/MovieInfoModel.tsx'));

function App() {
  // Automatically refresh access token on page load/reload
  useTokenRefreshOnLoad(); // Run the hook but don't block rendering
  useDetectCountry();

  return (
      <>
          <main>
                <Routes>
                    <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/discover" element={<DiscoverPage />} />

                    <Route path="/my-list" element={
                        <Suspense fallback={<MyListPageSkeleton />}>
                        <ProtectedRoute
                            authorized={<MyListPage />}
                            loadingFallback={<MyListPageSkeleton />}
                        />
                        </Suspense>

                    } />
                    <Route path="/profile" element={
                        <Suspense fallback={<ProfilePageSkeleton/>} >
                            <ProtectedRoute
                                authorized={<ProfilePage />}
                                loadingFallback={<ProfilePageSkeleton />}
                            />
                        </Suspense>
                    } />
                    <Route path="/settings" element={
                        <Suspense fallback={<SettingsPageSkeleton />}>

                            <ProtectedRoute
                                authorized={<SettingsPage />}
                                loadingFallback={<SettingsPageSkeleton />}
                            />
                       </Suspense>
                    } />

                    <Route path="/forget-password" element={<ForgetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/change/email" element={<ProtectedRoute authorized={<ChangeEmail />} />} />
                    <Route path="/oauth/success" element={<OauthSuccessPage />} />

                    <Route path="/find" element={<FindUsers />} />
                    <Route path="/users/:username" element={
                        <Suspense fallback={<ProfilePageSkeleton />}>
                            <UserPage />
                        </Suspense>
                    } />

                    <Route path="/signin" element={
                        <GuestRoute>
                            <Suspense fallback={<LoadingSpinner size={"large"} message={"Loading..."} />}>
                                <SigninPage />
                            </Suspense>
                        </GuestRoute>
                    } />
                    <Route path="/signup" element={
                        <GuestRoute>
                            <Suspense fallback={<LoadingSpinner size={"large"} message={"Loading..."} />}>
                                <SignupPage />
                            </Suspense>
                        </GuestRoute>
                    } />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
          </main>

          {/* Bottom Navigation - Mobile Only */}
          <BottomNav />

          {/* Global Toast Listener - Redux Connected */}
          <ToastListener />

          {/* Modals Portal */}
          <ShareMovieModal />

          {/* Global Movie Info Modal - URL Driven */}
          <Suspense fallback={null}>
              <MovieInfoModal />
          </Suspense>
      </>
  )
}

export default App;