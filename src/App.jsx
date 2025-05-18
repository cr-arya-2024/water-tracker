

import './App.css'
import GlassModel from './components/GlassModel'
import WaveBackground from './components/WaveBackground'
import { useState, useEffect } from 'react'



function App() {
  const [currentWaterLevel, setCurrentWaterLevel] = useState(2);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsLevel, setCongratsLevel] = useState(0);
  const [streak, setStreak] = useState(() => {
    // Initialize streak from localStorage if available
    const savedStreak = localStorage.getItem('waterStreak');
    return savedStreak ? JSON.parse(savedStreak) : { count: 0, lastUpdated: null };
  });

  // Check and update streak when component mounts
  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  // Save streak to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waterStreak', JSON.stringify(streak));
  }, [streak]);

  // Function to check and update streak based on date
  const checkAndUpdateStreak = () => {
    const today = new Date().toDateString();
    
    if (!streak.lastUpdated) {
      // First time using the app
      setStreak({ count: 0, lastUpdated: today });
      setCurrentWaterLevel(0); // Reset water level for new users
    } else if (streak.lastUpdated === today) {
      // Already updated today, do nothing
      return;
    } else {
      const lastDate = new Date(streak.lastUpdated);
      const currentDate = new Date(today);
      
      // Calculate the difference in days
      const timeDiff = currentDate.getTime() - lastDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        // Consecutive day, increase streak
        setStreak({ count: streak.count + 1, lastUpdated: today });
      } else if (dayDiff > 1) {
        // Streak broken, reset to 0
        setStreak({ count: 0, lastUpdated: today });
      }
      // Reset water level at the start of any new day
      setCurrentWaterLevel(0);
    }
  };

  // Handler for water level changes from GlassModel
  const handleWaterLevelChange = (level) => {
    if (level > currentWaterLevel) {
      setCongratsLevel(level);
      setShowCongrats(true);
      
      // Increment streak when level 5 is reached
      if (level === 5) {
        const today = new Date().toDateString();
        if (streak.lastUpdated !== today) {
          setStreak({ count: streak.count + 1, lastUpdated: today });
        }
        // Reset water level to 0 after reaching level 5
        setCurrentWaterLevel(0);
      } else {
        // Update water level for levels 1-4
        setCurrentWaterLevel(level);
      }
      
      setTimeout(() => {
        setShowCongrats(false);
      }, 3000);
    }
    
    setCurrentWaterLevel(level);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative w-22 h-full flex justify-start align-middle">
      {/* Streak display */}
      <div className="absolute top-4 right-4 z-50 bg-yellow-400 rounded-full p-2 flex items-center justify-center streak-container">
        <span className="text-white font-bold text-lg">{streak.count}🔥</span>
      </div>
      
      {/* Congratulation overlay */}
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center water-level-transition">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Congratulations! 🎉</h2>
            <p className="text-lg">You've reached Level {congratsLevel}!</p>
            {congratsLevel === 5 && streak.count > 0 && (
              <p className="text-yellow-500 font-bold mt-2">🔥 {streak.count} day streak! Keep it up!</p>
            )}
            <div className="py-4">
              <div className="firework"></div>
              <div className="firework"></div>
              <div className="firework"></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-0 left-0 h-full w-full z-4 bg-yellow-200">
        {/* Wave background with lower z-index */}
        <WaveBackground className="absolute top-0 left-0" />
        <div className="absolute flex justify-center align-middle top-0 left-0 h-full w-96 px-6 z-10">
          <div className="bg-white rounded-2xl p-3 absolute left-9 h-3/4 w-full mt-24 shining-border">
            <div className='text-black'>
              {currentWaterLevel >= 1 ? (
                <div id="1" className="water-level-transition">
                  <h1 className='text-blue-900 text-3xl text-bold' style={{animationDelay: '0.2s'}}>1st liter</h1>
                  <p className='font-poppins text-blue-900 ' style={{animationDelay: '0.8s'}}>• Re-hydrates after the night → clearer thinking within 20 min</p>
                  <p className='font-poppins  text-blue-800' style={{animationDelay: '0.8s'}}>• Kick-starts kidney filtration, urine turns lighter</p>
                </div>
              ) : <div className='p-6 water-level-transition'> <h1 className='text-blue-900 text-3xl text-bold' style={{animationDelay: '0.2s'}}>LEVEL 1</h1>
                  <p className='font-poppins text-blue-900 ' style={{animationDelay: '0.8s'}}>Unlock by drinking 1L of water</p>
                  <p className=' text-blue-900 ' style={{animationDelay: '0.8s'}}>Rec:7:00-8:30(AM)</p></div>}
              
              {currentWaterLevel >= 2 ? (
                <div id="2" className="water-level-transition">
                  <h1 className='text-blue-700 text-3xl text-bold' style={{animationDelay: '0.4s'}}>2nd liter</h1>
                  <p className='font-poppins text-blue-600' style={{animationDelay: '0.8s'}}>• Maintains plasma volume → steadier energy and heart rate through midday</p>
                  <p className='font-poppins  text-blue-600' style={{animationDelay: '0.8s'}}>• Supports saliva & stomach acid production → smoother digestion at lunch</p>
                </div>
              ) : <div className='p-6 water-level-transition'> <h1 className='text-blue-700 text-3xl text-bold' style={{animationDelay: '0.4s'}}>LEVEL 2</h1>
                  <p className='font-poppins text-blue-600' style={{animationDelay: '0.8s'}}>Unlock by drinking 2L of water</p>
                  <p className=' text-blue-900 ' style={{animationDelay: '0.8s'}}>Rec:10:00-11:30(AM)</p></div>}
              
              {currentWaterLevel >= 3 ? (
                <div id="3" className="water-level-transition">
                  <h1 className='text-blue-500 text-3xl text-bold' style={{animationDelay: '0.6s'}}>3rd liter</h1>
                  <p className='font-poppins text-blue-400 ' style={{animationDelay: '0.8s'}}>• 20-30 kcal extra thermogenesis if taken cool</p>
                  <p className='font-poppins text-blue-400' style={{animationDelay: '0.8s'}}>•Noticeable appetite blunting when 300 mL is drunk 30 min pre-meal</p>
                </div>
              ) : <div className='p-6 water-level-transition'> <h1 className='text-blue-500 text-3xl text-bold' style={{animationDelay: '0.6s'}}>LEVEL 3</h1>
                  <p className='font-poppins text-blue-400' style={{animationDelay: '0.8s'}}>Unlock by drinking 3L of water</p>
                  <p className=' text-blue-900 ' style={{animationDelay: '0.8s'}}>Rec:12:30-2:30(PM)</p></div>}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 ml-16 h-full w-96 z-4">
          <div className="bg-white rounded-2xl p-3 absolute right-9 h-3/4 w-full mt-24 shining-border">
            {currentWaterLevel >= 4 ? (
              <div id="4" className="water-level-transition">
                <h1 className='text-blue-600 text-3xl text-bold' style={{animationDelay: '0.8s'}}>4th liter</h1>
                <p className='font-poppins text-blue-700' style={{animationDelay: '0.8s'}}>• Further dilutes blood urea & uric acid → kidneys work easier, risk of stones drops</p>
                <p className='font-poppins  text-blue-700' style={{animationDelay: '0.8s'}}>•Synovial fluid replenished → joints feel less "creaky" late in the day</p>
                <p className='font-poppins  text-blue-700' style={{animationDelay: '0.8s'}}>• Mood steadier; dehydration-triggered cortisol stays low</p>
              </div>
            ) : <div className='p-6 water-level-transition'> <h1 className='text-blue-600 text-3xl text-bold' style={{animationDelay: '0.8s'}}>LEVEL 4</h1>
                <p className='font-poppins text-blue-700' style={{animationDelay: '0.8s'}}>Unlock by drinking 4L of water</p>
                <p className=' text-blue-900 ' style={{animationDelay: '0.8s'}}>Rec:5:00-6:30(PM)</p></div>}
            
            {currentWaterLevel >= 5 ? (
              <div id="5" className="water-level-transition">
                <h1 className='text-blue-800 text-3xl text-bold' style={{animationDelay: '1s'}}>5th liter</h1>
                <p className='font-poppins  text-blue-800' style={{animationDelay: '0.8s'}}>• Supports long workouts or outdoor labor without cardiovascular strain</p>
                <p className='font-poppins  text-blue-800' style={{animationDelay: '0.8s'}}>•Maximizes collagen & dermal hydration—skin elasticity improves over weeks</p>
                <p className='font-poppins  text-blue-900' style={{animationDelay: '0.8s'}}>•Exercise recovery aided: better nutrient transport & waste removal</p>
              </div>
            ) : <div className='p-6 water-level-transition'> <h1 className='text-blue-800 text-3xl text-bold' style={{animationDelay: '1s'}}>LEVEL 5</h1>
                <p className='font-poppins text-blue-800' style={{animationDelay: '0.8s'}}>Unlock by drinking 5L of water</p>
                <p className=' text-blue-900 ' style={{animationDelay: '0.8s'}}>Rec:9:00-10:30(PM)</p></div>}
          </div>
        </div>
      </div>
      <GlassModel 
        className="relative top-4 right-4 w-[300px] h-[300px] z-99" 
        onWaterLevelChange={handleWaterLevelChange}
      />
      <div 
        className={`absolute top-4 right-32 z-50 bg-white rounded-lg pb-1 pt-1 p-3  shadow-lg transition-all duration-300 ${isExpanded ? 'w-64 h-64' : 'w-32 h-8'}`}
        onClick={toggleExpand}
      >
        <div className="text-center font-bold text-gray-700 mb-2">
          {new Date().toLocaleDateString()}
        </div>
        {isExpanded && (
          <div>
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 text-center mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate()}, (_, i) => {
                const day = i + 1;
                const dateString = new Date(new Date().setDate(day)).toDateString(); // Get date string for the day
                const isToday = day === new Date().getDate();
                // Check if the date is in the completedDates array
                const isCompletedDay = completedDates.includes(dateString);
                
                return (
                  <div
                    key={day}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${isToday ? 'border-2 border-blue-500' : ''}
                      ${isCompletedDay ? 'bg-green-500 text-white' : 'bg-gray-100'} // Use green for completed days
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
