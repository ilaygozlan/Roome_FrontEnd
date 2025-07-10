import { getAuth } from "firebase/auth";

const auth = getAuth();

export const checkIfAdmin = async () => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  try {
    const idTokenResult = await user.getIdTokenResult(true); // force refresh
    console.log("Custom claims:", idTokenResult.claims);
    return idTokenResult.claims.admin === true;
  } catch (error) {
    console.error("Error checking custom claims:", error);
    return false;
  }
};
