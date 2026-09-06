import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (variant) => {
    switch (variant) {
      case "danger":
        return <FiAlertCircle className="me-2 text-danger fs-6" />;
      case "info":
        return <FiInfo className="me-2 text-info fs-6" />;
      default:
        return <FiCheckCircle className="me-2 text-success fs-6" />;
    }
  };

  const getTitle = (variant) => {
    switch (variant) {
      case "danger":
        return "Error";
      case "info":
        return "Notice";
      default:
        return "Success";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1090, position: "fixed" }}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            onClose={() => removeToast(t.id)}
            show={true}
            delay={t.duration}
            autohide
            className="shadow-sm border-0"
            role="status"
          >
            <Toast.Header closeButton>
              {getIcon(t.variant)}
              <strong className="me-auto small">{getTitle(t.variant)}</strong>
            </Toast.Header>
            <Toast.Body className="small text-body py-2">{t.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
