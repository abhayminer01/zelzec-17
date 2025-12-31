import { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);
    const toggleSettings = () => setIsSettingsOpen(prev => !prev);

    return (
        <SettingsContext.Provider value={{
            isSettingsOpen,
            openSettings,
            closeSettings,
            toggleSettings
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => useContext(SettingsContext);
