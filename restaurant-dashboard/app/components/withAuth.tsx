"use client";

// We need to import some types from React and the router from Next.js
import { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';

// This is the HOC function. It's a function that returns a component.
// The <P extends object> is a generic type, allowing us to pass props through.
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {

  // The HOC returns a new component... let's call it AuthComponent.
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // The core of our security check happens in a `useEffect` hook.
    // This hook runs after the component tries to mount in the browser.
    useEffect(() => {
      // We check for the token in localStorage.
      const token = localStorage.getItem('accessToken');
      
      // If there's no token, the user is not authenticated.
      if (!token) {
        // We use router.replace() to redirect them to the login page.
        // `replace` is used instead of `push` to prevent the user from
        // being able to click the "back" button to the protected page.
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
    }, [router]); // The dependency array ensures this effect runs only once on mount.

    if (!isAuthenticated) {
      return null; // Or a loading spinner
    }

    // If the token *does* exist, we simply render the original page component
    // that was passed into the HOC, along with any props it needs.
    return <WrappedComponent {...props} />;
  };

  // We return the newly created component that contains our security logic.
  return AuthComponent;
};

export default withAuth;
