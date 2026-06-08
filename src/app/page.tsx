'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// Firebase Config-gaagii rasmiga ahaa oo dhammaystiran
const firebaseConfig = {
  apiKey: "AIzaSyAdv5VHdfIaGOHkaBa580nsxoW71BsvjOg",
  authDomain: "aljazeera-class.firebaseapp.com",
  databaseURL: "https://aljazeera-class-default-rtdb.firebaseio.com", // Toos ugu xidhan Realtime Database-kaaga
  projectId: "aljazeera-class",
  storageBucket: "aljazeera-class.firebasestorage.app",
  messagingSenderId: "330534272238",
  appId: "1:330534272238:web:bc38e87867e2893d9e87ff",
  measurementId: "G-J2ZMX61RK2"
};

// Initialize Firebase (Habka Next.js u ammaan ah)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

interface Student {
  id: string;
  name: string;
  paymentType: string;
  amount: string;
  paid: boolean;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  
  // Admin Security
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Form Management
  const [name, setName] = useState('');
  const [payType, setPayType] = useState('ZAAD');
  const [amount, setAmount] = useState('2$');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. Realtime Countdown Timer (27 June 2026 @ 7:30 AM)
  useEffect(() => {
    const targetDate = new Date('2026-06-27T07:30:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. REALTIME DATA: Ka soo dhoofso xogta Firebase
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentList: Student[] = Object.values(data);
        setStudents(studentList);
      } else {
        // Marka ugu horreysa ee database-ku madhan yahay, ku shub 78-da arday
        const initialClass = [
          "Abdifatah Idris Mohamed", "Abdikariin Cabdi Maxamed", "Abdikariin Faisal Mohamed", 
          "Abdijamiil Ahmed Sahal", "Abdinajib Abdikariim Awil", "Abdirahman Bashe Diriye", 
          "Abdiraxim Mohamed Ismaciil", "Abdiraxman Muuxyadiin Cabdillahi", "Abdirhiim Said Ubahle", 
          "Abdishakuur Osman Mohamed", "Abokor Abdi Aadan", "Ahmed Xasan Maxamed", 
          "Ahmed Hamse Cabdillahi", "Ahmed Omar Mahamoud", "Amiin Farhan Cabdi", 
          "Ayaanle Eid Aden", "Ayuub Abdirahman Cabdi", "Bukhari Shafici Axmed", 
          "C/Fataax Khadar Aaden", "C/raxmaan Mahdi Yuusuf", "C/salaan Khadar Haaji", 
          "C/waasac Maxamed Ibrahim", "Maxamed Cumar", "Daariq Faysal Omer", 
          "Eid Ali Sahal", "Fad-hi Abdirisak Mohamed Bulhan", "Haashin Cabdi Maxamed", 
          "Jamaal Ahmed Mohamed", "Khalid Cumar Cali", "Khadar Hussein Osman", 
          "Luqman Abdifatah Saleban", "MahadMaxamuud Diriye", "Marawan Wahiib Axmed", 
          "Marwan Cismaan Maxamed", "Maxamed C/laahi Muuxumed", "Maxamed Cismaan C/laahi", 
          "Maxamed Siciid Ismaaciil", "Maxamed Siciid Maxamed", "Maxamed Xasan Maxamed", 
          "Maxamed Xasan Muuse", "Mohamed Abdi Kaise", "Mohamed Abdirahman DIIRIYE", 
          "Mohamed Aadan Abiib", "Mohamed Cabdi Mohamed", "Mohamed Yousuf Ali", 
          "Mubaarik Siciid Aadan", "Mustafe Osman Cabdillahi", "Nuse Cabdi Siciid", 
          "Nasrudiin Maxamed Jibriil", "Omar Abdihakim Kaahiye", "Omar Saleeban Mohamed", 
          "Ridwaan Faarah Xasan", "Saciid Abdikarim Xuseen", "Sakariye Hamse Cabdillahi", 
          "Sakariye Mohamed Ahmed", "Sakariye Omar Mohamed", "Sakariye Abdirahman Yusuf", 
          "Saciid Maxamed Cumar", "Saleeban Xasan Ali", "Salmaan Ali Mohamed", 
          "Salmaan Mohamed Dahir", "Shamsudiin Mohamed Dahir", "Siciid Deeq Maxamuud", 
          "Suleiman Mohamed Aadan", "Sudaysi Mohamed Ali", "Suhaib Cabdi Jama", 
          "Suhaib Cabdi Jama", "Suhaib Ibrahim Haamuud", "Suhayb Abdirisaak Ahmed", 
          "Suldaan Maxamed Xasan", "Suhayb Xasan Mohamed", "Suldaan Yusuf Mohamed", 
          "Warsame Cabdillahi Quule", "Xuseen Muuxyadiin Jibriil", "Yahye Hussein Yousuf", 
          "Yassin Mohamed Jama", "Yaxye Faysal Omer", "Yoonis Mohamed Jama"
        ].map((studentName, index) => ({
          id: (index + 1).toString(),
          name: studentName,
          paymentType: 'ZAAD',
          amount: '2$',
          paid: studentName === 'Salmaan Ali Mohamed'
        }));
        
        set(ref(db, 'students'), initialClass.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}));
        setStudents(initialClass);
      }
    });
  }, []);

  // 3. Admin Verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'password admin Aljazeera4200') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPassword('');
    } else {
      alert('Password-ku waa khaldan yahay!');
    }
  };

  // 4. Firebase Realtime Write
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetId = editingId || Date.now().toString();
    const targetStudent: Student = {
      id: targetId,
      name: name.trim(),
      paymentType: payType,
      amount: amount,
      paid: true
    };

    set(ref(db, `students/${targetId}`), targetStudent)
      .then(() => {
        setName('');
        setEditingId(null);
      });
  };

  const startEdit = (student: Student) => {
    setName(student.name);
    setPayType(student.paymentType);
    setAmount(student.amount);
    setEditingId(student.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Firebase Realtime Reset
  const handleDeleteOrReset = (id: string) => {
    if (confirm('Ma hubaal miyaa inaad ardaygan xaaladdiisa lacagta ka saarayso?')) {
      const targetStudent = students.find(s => s.id === id);
      if (targetStudent) {
        set(ref(db, `students/${id}`), { ...targetStudent, paid: false });
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase());
    return isAdmin ? matchesSearch : (student.paid && matchesSearch);
  });

  const theme = {
    bg: darkMode ? '#020C1B' : '#F8FAFC',
    cardBg: darkMode ? '#0A192F' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#0F172A',
    textMuted: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? '#1E293B' : '#E2E8F0',
    inputBg: darkMode ? '#020C1B' : '#F1F5F9'
  };

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', transition: 'all 0.3s ease', fontFamily: 'sans-serif', paddingBottom: '60px', perspective: '1000px' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp3D { from { opacity: 0; transform: translateY(40px) rotateX(-15px); } to { opacity: 1; transform: translateY(0) rotateX(0); } }
        .animate-3d-card { animation: fadeInUp3D 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .student-row { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .student-row:hover { transform: translateZ(15px) scale(1.01); background-color: ${darkMode ? 'rgba(59, 130, 246, 0.1) !important' : 'rgba(59, 130, 246, 0.05) !important'}; box-shadow: 0 10px 20px rgba(0, 229, 255, 0.15); }
        .glow-timer { text-shadow: 0 0 10px #3B82F6, 0 0 20px #00E5FF; }
      `}} />

      {/* HEADER */}
      <header style={{ backgroundColor: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '15px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#3B82F6' }}>
            Al jazeera Form Four <span style={{ fontSize: '12px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#60A5FA', padding: '3px 8px', borderRadius: '4px', marginLeft: '8px' }}>Class 4A</span>
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input
              type="text"
              placeholder={isAdmin ? "Raadi arday kasta..." : "Raadi magaca ardayga..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}`, padding: '8px 15px', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '240px' }}
            />
            <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLoginModal(true)} style={{ backgroundColor: isAdmin ? '#EF4444' : '#1E40AF', color: '#FFF', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isAdmin ? 'Logout Admin' : '🔑 Admin Login'}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🌓</button>
          </div>
        </div>
      </header>

      {/* COUNTDOWN */}
      <div className="animate-3d-card" style={{ maxWidth: '1100px', margin: '25px auto 0 auto', padding: '0 20px' }}>
        <div style={{ background: darkMode ? 'linear-gradient(135deg, #0A192F 0%, #020C1B 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)', border: `2px solid ${darkMode ? '#3B82F6' : '#93C5FD'}`, borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 0 25px rgba(59, 130, 246, 0.25)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: '#60A5FA', fontWeight: 'bold' }}>⏳ Waqtiga ka Hadhay Imtixaanka Shahaadiga ah (27 June 2026)</h3>
          <div className="glow-timer" style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '28px', fontWeight: '900', color: '#3B82F6' }}>
            <div><span style={{ display: 'block', fontSize: '36px' }}>{timeLeft.days}</span><span style={{ fontSize: '11px', color: theme.textMuted }}>Maalmood</span></div>
            <div>:</div>
            <div><span style={{ display: 'block', fontSize: '36px' }}>{timeLeft.hours}</span><span style={{ fontSize: '11px', color: theme.textMuted }}>Saacadood</span></div>
            <div>:</div>
            <div><span style={{ display: 'block', fontSize: '36px' }}>{timeLeft.minutes}</span><span style={{ fontSize: '11px', color: theme.textMuted }}>Daqiiqo</span></div>
            <div>:</div>
            <div><span style={{ display: 'block', fontSize: '36px', color: '#00E5FF' }}>{timeLeft.seconds}</span><span style={{ fontSize: '11px', color: theme.textMuted }}>Ilbiriqsi</span></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="animate-3d-card" style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* FOOMKA ADMIN-KA */}
        {isAdmin && (
          <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '25px', borderRadius: '12px', marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#60A5FA' }}>{editingId ? 'Wax ka beddel Xogta Ardayga' : 'Calaamadee Arday Cusub Oo Bixiyey'}</h2>
            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: theme.textMuted }}>Magaca Dhan</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Magaca ardayga..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} required />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: theme.textMuted }}>Nooca Lacagta</label>
                <select value={payType} onChange={(e) => { setPayType(e.target.value); setAmount(e.target.value === 'ZAAD' ? '2$' : '20,000 Shilling'); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }}>
                  <option value="ZAAD">ZAAD</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: theme.textMuted }}>Lacagta</label>
                <select value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }}>
                  {payType === 'ZAAD' ? (
                    <option value="2$">2$</option>
                  ) : (
                    <option value="20,000 Shilling">20,000 Shilling</option>
                  )}
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <button type="submit" style={{ width: '100%', padding: '11px', borderRadius: '6px', border: 'none', backgroundColor: '#1E40AF', color: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingId ? '💾 Update Realtime' : '✓ Approve Realtime'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SHAXDA */}
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderLeft: '4px solid #1E40AF', paddingLeft: '10px' }}>
          {isAdmin ? "Maamulka Fasalka (Dhammaan Ardayda)" : "Natiijada Ardayda Bixisay Lacagta (LQI)"}
        </h2>

        <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? '#020C1B' : '#F1F5F9', borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}>
                  <th style={{ padding: '18px 15px' }}>Magaca Ardayga</th>
                  <th style={{ padding: '18px 15px', textAlign: 'center' }}>Xaaladda</th>
                  <th style={{ padding: '18px 15px' }}>Nooca Lacagta</th>
                  <th style={{ padding: '18px 15px', textAlign: 'right' }}>Cadadka</th>
                  {isAdmin && <th style={{ padding: '18px 15px', textAlign: 'center' }}>Maamul</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr className="student-row" key={student.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: (!student.paid && isAdmin) ? 0.4 : 1 }}>
                      <td style={{ padding: '16px 15px', fontWeight: '500' }}>{student.name}</td>
                      <td style={{ padding: '16px 15px', textAlign: 'center' }}>
                        {student.paid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ADE80', borderRadius: '50%', width: '26px', height: '26px', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                        ) : (
                          <span style={{ color: '#EF4444', fontSize: '12px', backgroundColor: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Weli ma bixin</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 15px', color: theme.textMuted }}>{student.paid ? student.paymentType : '-'}</td>
                      <td style={{ padding: '16px 15px', textAlign: 'right', fontWeight: 'bold', color: student.paid ? '#4ADE80' : theme.textMuted }}>{student.paid ? student.amount : '-'}</td>
                      {isAdmin && (
                        <td style={{ padding: '16px 15px', textAlign: 'center' }}>
                          <button onClick={() => startEdit(student)} style={{ backgroundColor: '#F59E0B', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' }}>✏️ Sax</button>
                          <button onClick={() => handleDeleteOrReset(student.id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>❌ Ka Saar</button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>Arday magacaas leh lama helin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '30px', borderRadius: '12px', width: '340px' }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>Admin Verification</h3>
            <form onSubmit={handleLogin}>
              <input type="password" placeholder="Geli Password-ka..." value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text, marginBottom: '15px' }} autoFocus />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowLoginModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'none', color: theme.text }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#1E40AF', color: 'white', fontWeight: 'bold' }}>Giri</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}