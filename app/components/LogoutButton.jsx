import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'expo-router';

/**
 * @component LogoutButton
 * @description Simple logout button component that handles Firebase authentication signout.
 * Redirects to the login screen after successful logout.
 * 
 * Features:
 * - Firebase authentication integration
 * - Automatic navigation after logout
 * - Error handling for signout process
 * - Styled button with red background
 * 
 * @requires firebase/auth
 * @requires expo-router
 * 
 * Navigation:
 * - On successful logout: Redirects to '/Login'
 * - Uses router.replace to prevent back navigation
 */

export default function LogoutButton() {
  const router = useRouter();

  /**
   * Handles the logout process
   * @async
   * @function handleLogout
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 