// Summary.js
import React, { useState } from 'react';

const Summary = () => {
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://playbook-server-68b4560dd77b.herokuapp.com/rsvp_summary?password=${password}`);
            const data = await res.json();
            if (res.status === 200) {
                setSummary(data);
                setError('');
            } else {
                setError(data.error || 'Unauthorized');
                setSummary(null);
            }
            setSubmitted(true);
        } catch (err) {
            setError('Error fetching data.');
            setSummary(null);
            setSubmitted(true);
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Georgia, serif' }}>
            {!summary && (
                <form onSubmit={handleSubmit}>
                    <h2>RSVP Summary (Host Only)</h2>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid black' }}
                    />
                    <button type="submit" style={{ padding: '10px', borderRadius: '5px' }}>View Summary</button>
                    {submitted && error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            )}

            {summary && (
                <div>
                    <h3>Total People Attending: {summary.total_attending}</h3>

                    <div style={{ display: 'flex', gap: '40px', textAlign: 'left' }}>
                        {/* Attending Table */}
                        <div style={{ flex: 1 }}>
                            <h4>People Attending</h4>
                            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>People Attending</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.attending.map((person, idx) => (
                                        <tr key={idx}>
                                            <td>{person.display_name}</td>
                                            <td>{person.people_confirmed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Not Attending Table */}
                        <div style={{ flex: 1 }}>
                            <h4>RSVP’d but Not Attending</h4>
                            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.not_attending.map((name, idx) => (
                                        <tr key={idx}>
                                            <td>{name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
};

export default Summary;
