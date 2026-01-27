import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseConfig";
import { parseDateString } from "../utils/date";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  }, []);

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
        const { data: mastersData } = await supabase
          .from("masters")
          .select("name, avatar_url, address");

        const mastersMap = {};
        if (mastersData) {
          mastersData.forEach((m) => {
            mastersMap[m.name] = m;
          });
        }

        const { data: messagesData } = await supabase
          .from("messages")
          .select("chat_id, created_at, text")
          .order("created_at", { ascending: false });

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

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("client_name", userEmail)
          .order("created_at", { ascending: false });

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
    setBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item))
    );
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  }, []);

  const startChat = useCallback((masterName, avatarUrl) => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;
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
  }, [session]);

  const deleteChat = useCallback(async (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    await supabase.from("messages").delete().eq("chat_id", chatId);
  }, []);

  const value = useMemo(
    () => ({
      session,
      bookings,
      chats,
      addBooking,
      cancelBooking,
      startChat,
      deleteChat,
      userEmail: session?.user?.email,
      userMetadata: session?.user?.user_metadata,
      refreshUser,
    }),
    [session, bookings, chats, addBooking, cancelBooking, startChat, deleteChat, refreshUser]
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
