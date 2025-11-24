import { Outlet } from "react-router-dom"

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    direction: 'rtl',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  contentWrapper: {
    padding: '32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
  },
}

export default function DashboardLayout() {
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}