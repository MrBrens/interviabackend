'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Sidebar from '../components/Sidebar'
import { getAuthToken } from '@/utils/auth'
import { FiPlus, FiClock, FiUser, FiCalendar, FiX, FiLoader } from 'react-icons/fi'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

interface Meeting {
  id: number
  title: string
  date: Date
  duration: number
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date(),
    duration: 30,
    type: 'technical'
  })
  const [loading, setLoading] = useState(true)

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.MEETINGS)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched meetings data:', data)
        const meetingsWithDates = data.map((meeting: any) => ({
          ...meeting,
          date: new Date(meeting.date)
        }))
        console.log('Processed meetings:', meetingsWithDates)
        setMeetings(meetingsWithDates)
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async () => {
    try {
      if (!newMeeting.title.trim()) {
        alert('Veuillez entrer un titre pour la réunion');
        return;
      }

      const meetingData = {
        ...newMeeting,
        date: newMeeting.date.toISOString(),
        status: 'scheduled'
      };

      console.log('Sending meeting data:', meetingData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        const meeting = await response.json();
        console.log('Meeting created:', meeting);
        
        // Add the new meeting to the list
        const newMeetingWithDate = {
          ...meeting,
          date: new Date(meeting.date)
        };
        
        setMeetings(prev => [...prev, newMeetingWithDate]);
        setShowModal(false);
        setNewMeeting({
          title: '',
          date: new Date(),
          duration: 30,
          type: 'technical'
        });
        
        // Set the selected date to the new meeting's date
        setSelectedDate(new Date(meeting.date));
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert('Erreur lors de la création de la réunion: ' + (errorData.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Erreur lors de la création de la réunion. Veuillez réessayer.');
    }
  };

  const getMeetingsForDate = (date: Date) => {
    console.log('Getting meetings for date:', date);
    console.log('All meetings:', meetings);
    
    const meetingsForDate = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const isSameDay = 
        meetingDate.getFullYear() === date.getFullYear() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getDate() === date.getDate();
      
      console.log('Comparing dates:', {
        meetingDate,
        selectedDate: date,
        isSameDay
      });
      
      return isSameDay;
    });
    
    console.log('Found meetings for date:', meetingsForDate);
    return meetingsForDate;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto text-white flex flex-col md:ml-80 mt-2.5 sm:mt-0">
        {/* Header */}
        <motion.div
          className="w-full px-6 py-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  📅 Mes Réunions
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mt-2 font-medium">
                Gérez vos entretiens et réunions programmés.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <FiPlus /> Nouvelle réunion
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <FiLoader className="animate-spin h-8 w-8 text-emerald-400" />
              <span className="text-gray-300">Chargement des réunions...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Calendar */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Calendrier</h2>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                className="w-full"
                dayClassName={(date) => {
                  const meetingsForDate = getMeetingsForDate(date);
                  return meetingsForDate.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : '';
                }}
              />
            </motion.div>

            {/* Meetings List */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">
                {selectedDate ? (
                  `Réunions du ${selectedDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}`
                ) : (
                  'Sélectionnez une date'
                )}
              </h2>
              
              {selectedDate ? (
                <div className="space-y-4">
                  {getMeetingsForDate(selectedDate).map((meeting, index) => (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                          {meeting.title}
                        </h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          meeting.status === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' :
                          meeting.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {meeting.status === 'scheduled' ? 'Programmé' :
                           meeting.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-emerald-400" />
                          {meeting.type === 'technical' ? 'Technique' :
                           meeting.type === 'behavioral' ? 'Comportemental' : 'RH'}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-emerald-400" />
                          {meeting.duration} min
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {getMeetingsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-8">
                      <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 text-lg mb-2">Aucune réunion programmée</p>
                      <p className="text-gray-400 text-sm">Pour cette date</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg mb-2">Sélectionnez une date</p>
                  <p className="text-gray-400 text-sm">Pour voir les réunions</p>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* New Meeting Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Nouvelle réunion</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 placeholder-gray-400"
                    placeholder="Titre de la réunion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date et heure
                  </label>
                  <DatePicker
                    selected={newMeeting.date}
                    onChange={(date) => date && setNewMeeting(prev => ({ ...prev, date }))}
                    showTimeSelect
                    dateFormat="Pp"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Durée (minutes)
                  </label>
                  <select
                    value={newMeeting.duration}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1 heure 30</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type d'entretien
                  </label>
                  <select
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300"
                  >
                    <option value="technical">Technique</option>
                    <option value="behavioral">Comportemental</option>
                    <option value="hr">RH</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateMeeting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 mt-4"
                >
                  Créer la réunion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
