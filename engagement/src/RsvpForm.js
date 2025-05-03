import React, { useState } from 'react';
import './RsvpForm.css'
import Radio from '@mui/material/Radio';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const RsvpForm = () => {
    const [searchValue, setSearchValue] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [previousRsvp, setPreviousRsvp] = useState(null);
    const [step, setStep] = useState(1);
    const [peopleSelected, setPeopleSelected] = useState('');
    const [isAttending, setIsAttending] = useState(0);
    const [maxPeople, setMaxPeople] = useState(0);
    const [peopleConfirmed, setPeopleConfirmed] = useState(0);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    }

    const handleGuestSelect = (row) => {
        setSelectedId(row.id);
        setPeopleSelected(row.display_name);
    }

    const handleDialogClose = () => {
        window.location.reload();
    }

    const handleNext = () => {
        fetch(`https://playbook-server-68b4560dd77b.herokuapp.com/invited_people/${selectedId}`)
            .then(res => res.json())
            .then(data => {
                setMaxPeople(data.people_invited);
                setPeopleConfirmed(data.people_confirmed || 0);
                setIsAttending(data.rsvped ? (data.people_confirmed === 0 ? 2 : 1) : 0); // set attending status
                setPreviousRsvp(data.rsvped ? data.people_confirmed : null);
                setStep(2);
                if (data.rsvped && data.people_confirmed > 0) {
                    setIsAttending(1);
                }
        });
};

    const handleSubmit = (notComing=false) => {
        fetch('https://playbook-server-68b4560dd77b.herokuapp.com/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: selectedId,
                people_confirmed: notComing ? 0 : peopleConfirmed
            })
        })
            .then(res => res.json())
            .then(() => {
                alert("Thank you for your RSVP!");
                handleDialogClose();
            });
    };

    const handleSearchClick = () => {
        if (!searchValue) {
            return;
        }
        else {
            setResultsLoading(true);
            setDialogOpen(true);
        }

        fetch('https://playbook-server-68b4560dd77b.herokuapp.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchTerm: searchValue.trim() })
        })
            .then(response => response.json())
            .then(data => {
                setSearchValue('');
                setSearchList(data);
                setResultsLoading(false);

            })
            .catch(error => console.error(error));
    }

    return (
        <div className='form' >
            <h2 className='form-title'>Jaivik and Aayushi's Engagement</h2>
            <form>
                Kindly reply by July 1, 2025
            </form>
            <div className="search-bar">
                <input value={searchValue} onChange={(e) => handleSearchChange(e)} type="text" placeholder="Find your name..." />
                <button onClick={handleSearchClick} type="button">Search</button>
                <p style={{ marginTop: '10px' }}>
                    <a href="sms:+14846659002" style={{ color: '#000000' }}>
                        Contact Host
                    </a>
                </p>
                <p style={{ marginTop: '10px' , fontStyle: 'italic'}}>
                    Dress Code: Traditional Indian Attire
                    </p>
            </div>

            <Dialog fullWidth open={dialogOpen} onClose={() => handleDialogClose()}>
                <div className='dialog-root'>
                    {resultsLoading && <CircularProgress />}
                    {!resultsLoading && searchList.length === 0 &&
                        <span> Sorry! We couldn't find you. Please try your nickname or contact the Host.</span>
                    }
                    {step === 1 && <>{!resultsLoading && searchList.length > 0 &&
                        <>
                            <div>
                                {searchList.map((row, index) =>
                                    <div className='result-row' onClick={() => handleGuestSelect(row)}>
                                        <Radio checked={selectedId === row['id']} style={{ width: '10%' }} />
                                        <span style={{ display: 'flex', 'flexGrow': 1, textAlign: 'left' }}>
                                            {row['display_name']}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    }
                        <div className='popup-buttons-container'>
                            <button onClick={() => handleDialogClose()}>Close</button>
                            <button disabled={selectedId === null} onClick={handleNext}>Next</button>

                        </div>
                    </>}

                    {step === 2 && <>
                        <div className='form-title' style={{ fontSize: '18px' }}>
                            {peopleSelected}
                        </div>
                        {previousRsvp !== null && (
                            <div style={{ color: '#b29e66', marginTop: '5px' }}>
                                You previously RSVPed: {previousRsvp > 0 ? `${previousRsvp} attending` : 'Not attending'}
                            </div>
                        )}

                        <div style={{ display: 'flex', padding: '10px', width: '100%', justifyContent: 'center', gap: '20px' }}>
                            <Button
                                variant={isAttending === 1 ? 'contained' : 'outlined'}
                                sx={{
                                    backgroundColor: isAttending === 1 ? '#b29e66' : 'white',
                                    color: isAttending === 1 ? 'black' : '#b29e66',
                                    borderColor: '#b29e66',
                                }}
                                onClick={() => {
                                    setIsAttending(1);
                                }}
                                disableRipple
                                disableFocusRipple
                                disableTouchRipple
                            >
                                Attending
                            </Button>
                            <Button
                                variant={isAttending === 2 ? 'contained' : 'outlined'}
                                sx={{
                                    backgroundColor: isAttending === 2 ? '#b29e66' : 'white',
                                    color: isAttending === 2 ? 'black' : '#b29e66',
                                    borderColor: '#b29e66',
                                }}
                                onClick={() => setIsAttending(2)}
                                disableRipple
                                disableFocusRipple
                                disableTouchRipple
                            >
                                Not Attending
                            </Button>
                        </div>
                    </>}

                    {isAttending > 0 && <>
                        {isAttending === 2 &&
                            <div style={{ display: 'flex', padding: '10px', width: '100%', justifyContent: 'center', gap: '20px', color: '#b29e66', textAlign: 'center' }}>
                                We will miss your presence! You can always RSVP if your plans change!
                            </div>
                        }
                        {isAttending === 1 && <div style={{ display: 'flex', padding: '10px', width: '100%', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                            <IconButton
                                sx={{
                                    width: '40px', height: '40px', border: '1px solid #b29e66',
                                    backgroundColor: peopleConfirmed <= 1 ? '' : '#b29e66',
                                    '&:hover': {
                                        backgroundColor: peopleConfirmed <= 1 ? '' : '#b29e66',
                                    },
                                    '&:focus': {
                                        backgroundColor: peopleConfirmed <= 1 ? '' : '#b29e66',
                                    },
                                    '&:active': {
                                        backgroundColor: peopleConfirmed <= 1 ? '' : '#b29e66',
                                    }
                                }}
                                onClick={() => {
                                    if (peopleConfirmed === 1) return;
                                    else setPeopleConfirmed(peopleConfirmed - 1);
                                }}
                                disabled={peopleConfirmed <= 1}
                            >
                                <RemoveIcon />
                            </IconButton>
                            <span style={{ fontSize: '18px' }}>
                                {peopleConfirmed}
                            </span>
                            <IconButton
                                sx={{
                                    width: '40px', height: '40px', border: '1px solid #b29e66',
                                    backgroundColor: peopleConfirmed >= maxPeople ? '' : '#b29e66',
                                    '&:hover': {
                                        backgroundColor: peopleConfirmed >= maxPeople ? '' : '#b29e66',
                                    },
                                    '&:focus': {
                                        backgroundColor: peopleConfirmed >= maxPeople ? '' : '#b29e66',
                                    },
                                    '&:active': {
                                        backgroundColor: peopleConfirmed >= maxPeople ? '' : '#b29e66',
                                    }
                                }}
                                onClick={() => {
                                    if (peopleConfirmed === maxPeople) return;
                                    else setPeopleConfirmed(peopleConfirmed + 1);
                                }}
                                disabled={peopleConfirmed >= maxPeople}
                            >
                                <AddIcon />
                            </IconButton>
                        </div>}
                        <Button
                            variant='contained'
                            sx={{ backgroundColor: '#b29e66', color: 'black' }}
                            onClick={() => {
                                if (isAttending === 2) {
                                    setPeopleConfirmed(0); // Not attending
                                    handleSubmit(true);
                                } else {
                                    if (peopleConfirmed === 0){
                                        alert("Please select atleast 1 person attending.")
                                        return;
                                    }
                                    handleSubmit(); // Attending with selected count
                                }
                            }}
                        >
                            Submit
                        </Button>

                    </>}

                </div>
            </Dialog>
        </div>

    );
};

export default RsvpForm;