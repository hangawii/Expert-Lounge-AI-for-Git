// --- CONFIGURATION ---
// IMPORTANT: Replace with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwc4Cm9BYs4GVaumlWkPPQRX8pFe0d8wnBnW53h_B4SpOVN7ac4bUA6mZd8IEOvjyo/exec"; 

interface UserData {
  name: string;
  email: string;
  phone: string;
  company: string;
  department: string;
}

/**
 * Submits user data to Google Apps Script.
 * The Script handles BOTH saving to Google Sheets AND sending the Gmail notification.
 */
async function submitToGoogleScript(data: UserData): Promise<boolean> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("Google Script URL is not configured. Skipping submission.");
    return false;
  }

  try {
    // Using 'no-cors' mode is standard for submitting to Google Apps Script from frontend
    // Note: We cannot read the response in 'no-cors' mode, but the data will be sent.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Submitted to Google Script (Sheets + Gmail)");
    return true;
  } catch (error) {
    console.error("Failed to submit to Google Script:", error);
    return false;
  }
}

/**
 * Main function to handle data persistence
 */
export async function saveUserData(data: UserData): Promise<void> {
  // 1. Try to send to Google Script (which handles Sheets & Gmail)
  if (GOOGLE_SCRIPT_URL) {
    await submitToGoogleScript(data);
  } else {
    // 2. Fallback for demo if no URL provided
    await new Promise(resolve => setTimeout(resolve, 800));
    const existing = JSON.parse(localStorage.getItem('expert_lounge_users') || '[]');
    existing.push({ ...data, date: new Date().toISOString() });
    localStorage.setItem('expert_lounge_users', JSON.stringify(existing));
    console.log("Saved to local storage (Fallback)");
  }
}