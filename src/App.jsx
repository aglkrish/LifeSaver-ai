import React, { useState } from 'react'
import Topbar from './components/Topbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import BoardView from './pages/BoardView.jsx'
import ScheduleView from './pages/ScheduleView.jsx'
import HabitsView from './pages/HabitsView.jsx'
import TaskModal from './components/TaskModal.jsx'
import styles from './App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('board')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <Topbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTask={() => setModalOpen(true)}
      />
      <div className={styles.body}>
        <main className={styles.main}>
          {activeTab === 'board'    && <BoardView onAddTask={() => setModalOpen(true)} />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'habits'   && <HabitsView />}
        </main>
        <Sidebar />
      </div>
      {modalOpen && <TaskModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
