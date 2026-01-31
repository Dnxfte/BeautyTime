import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseConfig";
import { apiRequest } from "../api/server";
import { parseDateString } from "../utils/date";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setSessionLoading(false);
      })
      .catch(() => {
        if (mounted) setSessionLoading(false);
      });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  }, []);

  const getCurrentUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) return user;
    return session?.user || null;
  }, [session]);

  const getUserEmail = useCallback(async () => {
    const user = await getCurrentUser();
    return user?.email || null;
  }, [getCurrentUser]);

  useEffect(() => {
    let active = true;

    if (!session?.user?.email) {
      setBookings([]);
      setChats([]);
      return () => { active = false; };
    }

    const userEmail = session.user.email;
    const loadData = async () => {
      try {
        const mastersData = await apiRequest("/masters");

        const mastersMap = {};
        if (mastersData) {
          mastersData.forEach((m) => {
            mastersMap[m.name] = m;
          });
        }

        const messagesData = await apiRequest("/messages");

        if (messagesData && active) {
          const uniqueChats = [];
          const seen = new Set();
          messagesData.forEach((msg) => {
            if (msg.chat_id.includes(userEmail)) {
              if (!seen.has(msg.chat_id)) {
                seen.add(msg.chat_id);
                const masterName = msg.chat_id.split(':')[0];
                const masterInfo = mastersMap[masterName];
                uniqueChats.push({
                  id: msg.chat_id,
                  name: masterName,
                  lastMessage: msg.text,
                  avatar: masterInfo ? masterInfo.avatar_url : null,
                  unread: 0,
                });
              }
            }
          });
          setChats(uniqueChats);
        }

        const bookingsData = await apiRequest("/bookings");

        if (bookingsData && active) {
          const now = new Date();
          const formattedBookings = bookingsData.map((b) => {
            const masterInfo = mastersMap[b.master_name];
            const bookingDate = parseDateString(b.date_time);
            let currentStatus = b.status;
            if (currentStatus === "active" && bookingDate < now) {
              currentStatus = "history";
            }
            return {
              id: b.id.toString(),
              date: b.date_time,
              master: b.master_name,
              status: currentStatus,
              address: masterInfo ? masterInfo.address : "Адреса не вказана",
              avatar_url: masterInfo ? masterInfo.avatar_url : null,
            };
          });
          setBookings(formattedBookings);
        }
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [session]);

  const addBooking = useCallback((newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  }, []);

  const cancelBooking = useCallback(async (id) => {
    try {
      await apiRequest(`/bookings/${id}/cancel`, { method: "PATCH" });
      setBookings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item))
      );
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const startChat = useCallback((masterName, avatarUrl, userEmailOverride) => {
    const userEmail = userEmailOverride || session?.user?.email;
    if (!userEmail) return null;
    const uniqueChatId = `${masterName}:${userEmail}`;
    setChats((prev) => {
      if (prev.find((c) => c.id === uniqueChatId)) return prev;
      const newChat = {
        id: uniqueChatId,
        name: masterName,
        avatar: avatarUrl,
        unread: 0,
        lastMessage: "Початок діалогу",
      };
      return [newChat, ...prev];
    });
    return uniqueChatId;
  }, [session]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      await apiRequest(`/messages/${encodeURIComponent(chatId)}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      sessionLoading,
      bookings,
      chats,
      addBooking,
      cancelBooking,
      startChat,
      deleteChat,
      getCurrentUser,
      getUserEmail,
      userEmail: session?.user?.email,
      userMetadata: session?.user?.user_metadata,
      refreshUser,
    }),
    [session, sessionLoading, bookings, chats, addBooking, cancelBooking, startChat, deleteChat, getCurrentUser, getUserEmail, refreshUser]
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error("useBookings must be used within BookingsProvider");
  }
  return context;
}
