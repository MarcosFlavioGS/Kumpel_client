import { CSSProperties } from "react";

const styles: { 
  container: CSSProperties;
  chatBox: CSSProperties;
  header: CSSProperties;
  messagesContainer: CSSProperties;
  message: CSSProperties;
  form: CSSProperties;
  input: CSSProperties;
  button: CSSProperties;
} = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
    padding: "16px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    fontSize: "1.5em",
    marginBottom: "16px",
    color: "#333",
    textAlign: "center",
  },
  messagesContainer: {
    width: "100%",
    maxHeight: "300px",
    overflowY: "scroll",
    padding: "8px",
    marginBottom: "16px",
    backgroundColor: "#f7f7f7",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  message: {
    color: "#333",
    marginBottom: "8px",
  },
  form: {
    display: "flex",
    width: "100%",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginRight: "8px",
    fontSize: "1em",
    backgroundColor: "#ffffff",
    color: "#333333",
},
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1em",
    transition: "background-color 0.3s",
  },
};

export default styles;
