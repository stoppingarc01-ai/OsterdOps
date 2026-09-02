"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithPhoneNumber,
  type ApplicationVerifier,
  type ConfirmationResult,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { User, Organization, OrganizationMember } from "@/types";

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
}

export interface UserOrganizationData {
  organization: Organization;
  membership: OrganizationMember;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  organizations: UserOrganizationData[];
  userOrganizations: Organization[];
  currentOrg: Organization | null;
  currentMembership: OrganizationMember | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: ApplicationVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, otpCode: string) => Promise<UserCredential>;
  registerWithPhone: (params: {
    confirmationResult: ConfirmationResult;
    otpCode: string;
    name: string;
    organizationName: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<UserOrganizationData[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return await currentUser.getIdToken(forceRefresh);
    } catch {
      return null;
    }
  }, []);

  // Synchronize user profile & organizations from server API
  const refreshUser = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        setUserProfile(null);
        setOrganizations([]);
        setCurrentOrg(null);
        setCurrentMembership(null);
        return;
      }

      const res = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setUserProfile(payload.data.user);
          const orgs: UserOrganizationData[] = payload.data.organizations || [];
          setOrganizations(orgs);

          if (orgs.length > 0) {
            // Keep current selected org if valid, else pick first
            setCurrentOrg((prev) => {
              const matched = prev ? orgs.find((o) => o.organization.id === prev.id) : null;
              return matched ? matched.organization : orgs[0].organization;
            });
            setCurrentMembership((prev) => {
              const matched = prev ? orgs.find((o) => o.membership.userId === prev.userId) : null;
              return matched ? matched.membership : orgs[0].membership;
            });
          }
        }
      }
    } catch (err) {
      console.error("[OsterdOps AuthContext] refreshUser error:", err);
    }
  }, [getIdToken]);

  // Auth State Listener
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          if (typeof document !== "undefined") {
            document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
          }
        } catch {
          // ignore cookie sync failure
        }
        await refreshUser();
      } else {
        if (typeof document !== "undefined") {
          document.cookie = "__session=; path=/; max-age=0; SameSite=Lax";
        }
        setUserProfile(null);
        setOrganizations([]);
        setCurrentOrg(null);
        setCurrentMembership(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUser]);

  // Sign In with email & password
  const signIn = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      setError(null);
      setIsLoading(true);
      try {
        const auth = getFirebaseAuth();
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );

        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        setUser(credential.user);
        await refreshUser();
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        let userMessage = "Failed to log in. Please check your credentials.";

        if (
          fbErr.code === "auth/invalid-credential" ||
          fbErr.code === "auth/user-not-found" ||
          fbErr.code === "auth/wrong-password"
        ) {
          userMessage = "Invalid email or password. Please try again.";
        } else if (fbErr.code === "auth/too-many-requests") {
          userMessage = "Too many failed attempts. Please reset your password or try again later.";
        } else if (fbErr.code === "auth/user-disabled") {
          userMessage = "This account has been disabled. Please contact support.";
        } else if (fbErr.code === "auth/invalid-email") {
          userMessage = "Please enter a valid email address.";
        }

        setError(userMessage);
        throw new Error(userMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  // Sign Up with email, password, profile info & organization creation
  const signUp = useCallback(
    async (params: SignUpParams) => {
      setError(null);
      setIsLoading(true);
      try {
        const auth = getFirebaseAuth();
        const displayName = `${params.firstName} ${params.lastName}`.trim();

        // 1. Create Firebase Auth user
        const credential = await createUserWithEmailAndPassword(
          auth,
          params.email.trim(),
          params.password
        );

        // 2. Update display name in Firebase Auth profile
        if (displayName) {
          await updateProfile(credential.user, { displayName });
        }

        // 3. Obtain fresh ID token
        const idToken = await credential.user.getIdToken(true);

        // 4. Initialize Firestore user profile, organization, and OWNER membership on server
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            displayName,
            companyName: params.companyName.trim(),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || "Failed to initialize organization profile.");
        }

        const payload = await res.json();
        if (payload.success && payload.data) {
          setUser(credential.user);
          setUserProfile(payload.data.user);
          setCurrentOrg(payload.data.organization);
          setCurrentMembership(payload.data.member);
          setOrganizations([
            {
              organization: payload.data.organization,
              membership: payload.data.member,
            },
          ]);
        }
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        let userMessage = (err as Error).message || "Failed to create account.";

        if (fbErr.code === "auth/email-already-in-use") {
          userMessage = "An account with this email already exists. Please sign in instead.";
        } else if (fbErr.code === "auth/weak-password") {
          userMessage = "Password should be at least 6 characters.";
        } else if (fbErr.code === "auth/invalid-email") {
          userMessage = "Please enter a valid email address.";
        }

        setError(userMessage);
        throw new Error(userMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Sign In with Google OAuth Popup
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);

      const idToken = await credential.user.getIdToken(true);

      // Register or sync user profile on backend
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName: credential.user.displayName || credential.user.email?.split("@")[0] || "User",
          companyName: `${credential.user.displayName || "My"}'s Workspace`,
        }),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setUser(credential.user);
          setUserProfile(payload.data.user);
          setCurrentOrg(payload.data.organization);
          setCurrentMembership(payload.data.member);
          await refreshUser();
        }
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr.code !== "auth/popup-closed-by-user") {
        const userMessage = "Google authentication failed. Please try again.";
        setError(userMessage);
        throw new Error(userMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Phone Step 1: Send SMS OTP
  const signInWithPhone = useCallback(
    async (phoneNumber: string, appVerifier: ApplicationVerifier): Promise<ConfirmationResult> => {
      setError(null);
      setIsLoading(true);
      try {
        const auth = getFirebaseAuth();
        return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        let userMsg = "Failed to dispatch SMS verification code.";
        if (fbErr.code === "auth/invalid-phone-number") {
          userMsg = "The phone number format is invalid. Please verify.";
        } else if (fbErr.code === "auth/quota-exceeded" || fbErr.code === "auth/too-many-requests") {
          userMsg = "SMS quota or rate limit exceeded. Please wait a moment.";
        } else if (fbErr.code === "auth/captcha-check-failed") {
          userMsg = "Security reCAPTCHA verification failed. Please try again.";
        }
        setError(userMsg);
        throw new Error(userMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Phone Step 2: Confirm OTP & Sign In
  const confirmPhoneOtp = useCallback(
    async (confirmationResult: ConfirmationResult, otpCode: string): Promise<UserCredential> => {
      setError(null);
      setIsLoading(true);
      try {
        const credential = await confirmationResult.confirm(otpCode);
        setUser(credential.user);
        const token = await credential.user.getIdToken(true);
        if (typeof document !== "undefined") {
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
        }
        await refreshUser();
        return credential;
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        let userMsg = "Invalid verification code. Please check and retry.";
        if (fbErr.code === "auth/code-expired") {
          userMsg = "The verification code has expired. Please request a new code.";
        }
        setError(userMsg);
        throw new Error(userMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  // Phone Registration: Confirm OTP & Provision Workspace
  const registerWithPhone = useCallback(
    async ({
      confirmationResult,
      otpCode,
      name,
      organizationName,
      phone,
    }: {
      confirmationResult: ConfirmationResult;
      otpCode: string;
      name: string;
      organizationName: string;
      phone: string;
    }): Promise<void> => {
      setError(null);
      setIsLoading(true);
      try {
        const credential = await confirmationResult.confirm(otpCode);
        setUser(credential.user);

        try {
          await updateProfile(credential.user, { displayName: name.trim() });
        } catch {
          // Non-fatal
        }

        const idToken = await credential.user.getIdToken(true);
        if (typeof document !== "undefined") {
          document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
        }

        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid: credential.user.uid,
            name: name.trim(),
            organizationName: organizationName.trim(),
            phone: phone.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to provision workspace account.");
        }

        await refreshUser();
      } catch (err: unknown) {
        const msg = (err as Error).message || "Registration with phone failed.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  // Sign Out
  const signOut = useCallback(async () => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
      if (typeof document !== "undefined") {
        document.cookie = "__session=; path=/; max-age=0; SameSite=Lax";
      }
      setUser(null);
      setUserProfile(null);
      setOrganizations([]);
      setCurrentOrg(null);
      setCurrentMembership(null);
    } catch (err) {
      console.error("[OsterdOps AuthContext] signOut error:", err);
    }
  }, []);

  // Password Reset
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      let userMessage = "Failed to send reset email. Please verify the address.";
      if (fbErr.code === "auth/user-not-found") {
        userMessage = "No account found with this email address.";
      } else if (fbErr.code === "auth/invalid-email") {
        userMessage = "Please enter a valid email address.";
      }
      setError(userMessage);
      throw new Error(userMessage);
    }
  }, []);

  // Switch Active Organization
  const switchOrganization = useCallback(
    (orgId: string) => {
      const matched = organizations.find((o) => o.organization.id === orgId);
      if (matched) {
        setCurrentOrg(matched.organization);
        setCurrentMembership(matched.membership);
      }
    },
    [organizations]
  );

  const userOrganizations = useMemo(
    () => organizations.map((o) => o.organization),
    [organizations]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        organizations,
        userOrganizations,
        currentOrg,
        currentMembership,
        isLoading,
        error,
        signIn,
        signUp,
        signInWithPhone,
        confirmPhoneOtp,
        registerWithPhone,
        signOut,
        resetPassword,
        signInWithGoogle,
        switchOrganization,
        getIdToken,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
