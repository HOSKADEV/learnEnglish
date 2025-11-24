import { Gamepad2, FileText, Languages, Shuffle } from "lucide-react"
import { Link } from "react-router-dom"

const styles = {
  container: {
    maxWidth: '1024px',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
  },
  description: {
    color: '#6b7280',
    marginBottom: '24px',
    fontSize: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  gridTwoColumns: {
    gridTemplateColumns: '1fr 1fr',
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: '#1f2937',
  },
  cardText: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.6',
  },
}

export default function Main() {
  return (
    <div style={styles.container}>
  
    </div>
  )
}