import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AppHeader from './AppHeader';
import floralImage from './floral2.png';
import RsvpForm from './RsvpForm';
import proposal from './proposal.jpg';
import Summary from './Summary';
import { useEffect } from 'react';

function App() {
    return (
        <Router>
            <div className="App">
                <div className="main-content">
                    <img className='floral' src={floralImage} />
                    <div style={{ marginTop: '-40px' }}>
                        <h2 style={{ fontFamily: 'Georgia, serif', color: '#b29e66', fontSize: 28, margin: '20px 0' }}>RSVP</h2>
                        <img className='proposal' src={proposal} />
                        <Routes>
                            <Route path="/" element={<RsvpForm />} />
                            <Route path="/summary" element={<Summary />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;
