import { CSSProperties } from 'react'

const styles: {
  container: CSSProperties
  chatBox: CSSProperties
  header: CSSProperties
  errorMessage: CSSProperties // Added
  messagesContainer: CSSProperties
  message: CSSProperties
  form: CSSProperties
  input: CSSProperties
  button: CSSProperties
  send_button: CSSProperties
} = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#3A3F5C', // Changed to dark grey
    padding: '16px'
  },
  chatBox: {
    width: '100%',
    maxWidth: '400px',
    padding: '24px',
    borderRadius: '8px',
    backgroundColor: '#1F2833',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: {
    fontSize: '1.5em',
    marginBottom: '16px',
    color: '#fff',
    textAlign: 'center'
  },
  errorMessage: {
    // Added
    color: '#800020',
    fontSize: '18px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  messagesContainer: {
    width: '100%',
    maxHeight: '300px',
    overflowY: 'scroll',
    scrollBehavior: 'smooth',
    padding: '8px',
    marginBottom: '16px',
    backgroundColor: '#3A4158',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  message: {
    color: '#fff',
    marginBottom: '8px'
  },
  form: {
    display: 'flex',
    width: '100%'
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '16px',
    fontSize: '1em',
    backgroundColor: '#ffffff',
    color: '#333333'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#2E2F42',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s'
  },
  send_button: {
    width: '100px', // Set specific width
    height: '40px', // Set specific height
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#2E2F42',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s'
  }
}

export default styles
