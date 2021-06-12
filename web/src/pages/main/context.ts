import React from 'react';

const MainContext = React.createContext<{ title?: string | JSX.Element, alert?: (e: { type: "info" | "success" | "error" | "warning", message: string }) => void }>({})

export default MainContext
