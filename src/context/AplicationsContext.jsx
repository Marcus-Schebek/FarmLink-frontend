import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const { authToken } = useAuth();
  const [applications, setApplications] = useState([]);

  async function fetchApplications() {
    if (!authToken) return;
    try {
      const res = await fetch("http://localhost:3000/applications", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar aplicações");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <ApplicationsContext.Provider value={{ applications, fetchApplications }}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => useContext(ApplicationsContext);
