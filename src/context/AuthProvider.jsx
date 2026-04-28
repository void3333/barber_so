import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import { supabase } from "../app/lib/supabase.js";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [membership, setMembership] = useState(null);
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("PROFILE ERROR:", error);
            return null;
        }

        return data;
    }

    async function fetchMembership(userId) {
        const { data, error } = await supabase
            .from("memberships")
            .select(`
        role,
        barbershop:barbershops (
          id,
          name,
          slug,
          phone,
          plan,
          created_by
        )
      `)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("MEMBERSHIP ERROR:", error);
            return null;
        }

        return data;
    }

    const hydrateUser = useCallback(async (nextSession) => {
        const nextUser = nextSession?.user ?? null;

        setSession(nextSession ?? null);
        setUser(nextUser);

        if (!nextUser) {
            setProfile(null);
            setMembership(null);
            setBarbershop(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const [profileData, membershipData] = await Promise.all([
                fetchProfile(nextUser.id),
                fetchMembership(nextUser.id),
            ]);

            setProfile(profileData);
            setMembership(membershipData);
            setBarbershop(membershipData?.barbershop ?? null);
        } catch (error) {
            console.error("HYDRATE USER ERROR:", error);

            setProfile(null);
            setMembership(null);
            setBarbershop(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshAuth = useCallback(async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("SESSION ERROR:", error);
        }

        await hydrateUser(data?.session ?? null);
    }, [hydrateUser]);

    useEffect(() => {
        let isMounted = true;

        async function bootstrap() {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("SESSION ERROR:", error);
                }

                if (isMounted) {
                    await hydrateUser(data?.session ?? null);
                }
            } catch (error) {
                console.error("BOOTSTRAP ERROR:", error);

                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        bootstrap();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setTimeout(() => {
                if (isMounted) {
                    hydrateUser(nextSession);
                }
            }, 0);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [hydrateUser]);

    const value = useMemo(() => {
        return {
            user,
            session,
            profile,
            membership,
            barbershop,
            loading,
            isAuthenticated: !!user,
            refreshAuth,
        };
    }, [user, session, profile, membership, barbershop, loading, refreshAuth]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
