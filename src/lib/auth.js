import { supabase } from "./supabase";

/**
 * @typedef {Object} Credentials
 * @property {string} credential - The credential string from Google
 */

/**
 * Callback function for Google sign-in
 * @param {Credentials} response - The response containing Google credentials
 * @returns {Promise<void>}
 */
async function googleCallback(response) {
  console.log("Google sign-in callback received!");
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: response.credential,
  });
  if (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

/**
 * Signs up a new user with email and password
 * @param {string} username - The user's display name
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<{success: boolean, message: string}>} Result of the signup operation
 */
export async function signUp(username, email, password) {
  console.log("Signing up user!");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: username,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    if (error.message.includes("already registered")) {
      return {
        success: false,
        message: "This email is already registered. Please log in instead.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to sign up. Please try again.",
    };
  }

  return { success: true, message: "" };
}

/**
 * Signs in an existing user with email and password
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<{success: boolean, message: string}>} Result of the signin operation
 */
export async function signIn(email, password) {
  console.log("Signing up user!");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Signin error:", error);
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        message: "Invalid email or password. Please try again.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to sign in. Please try again.",
    };
  }

  return { success: true, message: "" };
}

/**
 * Sets up Google authentication
 * @param {"signin_with"|"signup_with"} text - The text to display on the Google button
 * @param {Function} post - Optional callback function to run after sign-in completes
 * @returns {Promise<void>}
 */
export async function setupGoogleAuth(text, post = () => {}) {
  try {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        await googleCallback(response);
        post();
      },
    });
    let signin = document.getElementById("googleSignIn");
    if (signin) {
      google.accounts.id.renderButton(signin, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
      });
      google.accounts.id.prompt(); // one tap dialog
    } else throw new Error("Google sign-in element not found");
  } catch (error) {
    console.error("Google auth setup error: ", error);
  }
}

/**
 * Checks if a user is currently authenticated
 * @returns {Promise<boolean>} True if user is authenticated, false otherwise
 */
export async function checkAuthStatus() {
  const { error } = await supabase.auth.getUser();
  if (error === null) {
    return true;
  }
  return false;
}

/**
 * Signs out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
