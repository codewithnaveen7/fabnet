import { ToastContext } from "../context/ToastProvider";
import { useContext } from "react";

export const useToast = () => useContext(ToastContext);
