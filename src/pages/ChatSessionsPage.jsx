import { useEffect } from "react";
import { useDispatch } from "react-redux";

import ChatSessionsTable from "../components/chat/ChatSessionsTable"; // adjust path if needed
import { resetChatState } from "../redux/features/chat/chatSlice";    // adjust path if needed

// ---------------------------------------------------------------------------
// ChatSessionsPage
// Example (React Router v6):
//   <Route path="/admin/chat" element={<ChatSessionsPage />} />
// ---------------------------------------------------------------------------
export default function ChatSessionsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Clean up Redux chat state when admin leaves the page
    return () => {
      dispatch(resetChatState());
    };
  }, [dispatch]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <ChatSessionsTable />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--color-background-primary, #fff)",
    width: "100%",
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    height: "100%",
    padding: "2rem 1.5rem",
    boxSizing: "border-box",
  },
};