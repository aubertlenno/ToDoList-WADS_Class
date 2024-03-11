import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Loading from "../Loader/Loading";

const SignIn = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState("checkingAuth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthStatus("checkingAuth");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setSignInError("Invalid email or password, please try again.");
      setAuthStatus("unauthenticated");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setSignInError(error.message);
      setAuthStatus("unauthenticated");
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus("authenticated");
        navigate("/");
      } else {
        setAuthStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (authStatus === "checkingAuth") {
    return <Loading />;
  }

  return (
    <section className="bg-bodyBg">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSignIn}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="name@company.com"
                  required=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required=""
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSignInError(""); // Optionally clear the error when the user starts typing
                  }}
                />
                {signInError && (
                  <p className="text-red-500 text-sm mt-2">{signInError}</p>
                )}{" "}
              </div>

              <button
                type="submit"
                className="w-full text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Sign in
              </button>

              <p className="text-sm font-light text-gray-500">
                Don't have an account yet?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-yellow-500 hover:underline"
                >
                  Sign up
                </Link>
              </p>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-gray-700 px-2 text-gray-500 dark:text-white">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:cursor-wait disabled:opacity-50"
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <clipPath id="p.0">
                        <path
                          d="m0 0l20.0 0l0 20.0l-20.0 0l0 -20.0z"
                          clipRule="nonzero"
                        ></path>
                      </clipPath>
                      <g clipPath="url(#p.0)">
                        <path
                          fill="currentColor"
                          fillOpacity="0.0"
                          d="m0 0l20.0 0l0 20.0l-20.0 0z"
                          fillRule="evenodd"
                        ></path>
                        <path
                          fill="currentColor"
                          d="m19.850197 8.270351c0.8574047 4.880001 -1.987587 9.65214 -6.6881847 11.218641c-4.700598 1.5665016 -9.83958 -0.5449295 -12.08104 -4.963685c-2.2414603 -4.4187555 -0.909603 -9.81259 3.1310139 -12.6801605c4.040616 -2.867571 9.571754 -2.3443127 13.002944 1.2301085l-2.8127813 2.7000687l0 0c-2.0935059 -2.1808972 -5.468274 -2.500158 -7.933616 -0.75053835c-2.4653416 1.74962 -3.277961 5.040613 -1.9103565 7.7366734c1.3676047 2.6960592 4.5031037 3.9843292 7.3711267 3.0285425c2.868022 -0.95578575 4.6038647 -3.8674583 4.0807285 -6.844941z"
                          fillRule="evenodd"
                        ></path>
                        <path
                          fill="currentColor"
                          d="m10.000263 8.268785l9.847767 0l0 3.496233l-9.847767 0z"
                          fillRule="evenodd"
                        ></path>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
              {/* <div className="flex items-center justify-between">
                <a
                  href="#"
                  className="text-sm font-medium text-yellow-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
